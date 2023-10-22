import z from "zod";
import { MySqlQueryResult, drizzle } from "drizzle-orm/mysql2";
import * as schema from "~/db/schema"
import mysql from "mysql2/promise";
import { eq, sql } from "drizzle-orm";
import * as crypto from "crypto"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createInsertSchema } from "drizzle-zod";
import { getWinningsFromOdds } from "~/utils/odds";

type LastInsertType = Array<LastInsertID>
type LastInsertID = Record<"insertedTicketNum" | "gameNumber", number>


const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const DrawSchema = createInsertSchema(schema.draws);

const db = drizzle(connection, { schema, mode: "planetscale" });

// RNG function
function getRNG(count=20, minValue=1, maxValue=80):number[]
{
  const selected = [];
  // let drawnNumbers: {[key: number]: number} = {}
  const rangeSize = Math.abs(maxValue - minValue) + 1

  while(selected.length < count){
      const randomBuffer = crypto.randomBytes(Math.ceil(Math.log2(rangeSize) / 8));
      const randomNum = randomBuffer.readUIntLE(0, randomBuffer.length) % rangeSize;

      if (selected.indexOf(randomNum) === -1){
          selected.push(randomNum);
          // drawnNumbers[selected.length] = randomNum
      }            
  }

  return selected
}

export const drawsRouter = createTRPCRouter({
  createDraw: publicProcedure
    .input(z.object({ data: DrawSchema }))
    .mutation(async ({ input }) => {
      const drawnNumbers =getRNG()
      const data = {...input.data, numbers_drawn: JSON.stringify(drawnNumbers)}
      return await db.insert(schema.draws).values(data);
    }),

    updateBetsWinningsByDraw: publicProcedure
    .input(z.object({ game_number: z.number() }))
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // get the draw
        const draws = schema.draws;
        const draw = await tx.query.draws.findFirst({
          where: eq(draws.game_number, input.game_number),
        });
        if (!draw?.numbers_drawn) throw new Error("No such draw");
        // numbers drawn from draw
        const numbersDrawn = JSON.parse(
          draw?.numbers_drawn as string,
        ) as number[];

        // get all bets for this game
        const bets = await tx
          .select()
          .from(schema.bets)
          .where(eq(schema.bets.game_number, draw.game_number));

        // update each bet
        const updatedBets = bets.map(async (bet) => {
          // picked list from the bet
          const numbersPickedByBet = JSON.parse(
            bet.picked_list as string,
          ) as number[];
          //   get hits
          const hits = numbersDrawn.filter((number) =>
            numbersPickedByBet.includes(number),
          ).length;

          // calculate winnings and update the bet
          const winning = getWinningsFromOdds(numbersPickedByBet.length, hits);
          if (!winning) throw new Error("Error while Calculating Odds");

          const newBet = {
            ...bet,
            hits: hits,
            redeemed_amount: winning * bet.wager_amount,
          };

          //   update the bets table using newBet
          return await tx.transaction(async (txx) => {
            await txx
              .update(schema.bets)
              .set(newBet)
              .where(eq(schema.bets.bet_id, newBet.bet_id));
            return newBet;
          });
        });
        return updatedBets;
      });
    }),

  getLastDraw: publicProcedure.query(async () => {
    const gameNumber: MySqlQueryResult = await db.execute(sql.raw(`SELECT MAX(game_number) AS gameNumber FROM draws WHERE premature = false`));
    const gameNumberArray: LastInsertType = gameNumber[0] as LastInsertType;
    const gameNumberID: LastInsertID = gameNumberArray[0]!;

    return gameNumberID
  }),

  updatePrematureDraw: publicProcedure.mutation(async () => {
    const updated = await db.update(schema.draws).set({ premature: false }).where(eq(schema.draws.premature, true));
    return updated
  }),

  getAllDraws: publicProcedure.query(async () => {
    const result = await db.query.draws.findMany({
      limit: 20,
    });
    return result;
  }),

  getDrawByGameNumber: publicProcedure
    .input(z.object({ gameNumber: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(schema.draws)
        .where(eq(schema.draws.game_number, input.gameNumber));

      return result;
    }),

  updateDrawByGamenumber: publicProcedure
    .input(z.object({ gameNumber: z.number(), data: DrawSchema }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(schema.draws)
        .set(input.data)
        .where(eq(schema.draws.game_number, input.gameNumber));
      return result;
    }),

  deleteDrawByGamenumber: publicProcedure
    .input(z.object({ gameNumber: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .delete(schema.draws)
        .where(eq(schema.draws.game_number, input.gameNumber));
      return result;
    }),
});


