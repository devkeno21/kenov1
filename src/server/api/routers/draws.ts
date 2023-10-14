import z from "zod";
import { MySqlQueryResult, drizzle } from "drizzle-orm/mysql2";
import * as schema from "~/db/schema"
import mysql from "mysql2/promise";
import { eq, sql } from "drizzle-orm";
import * as crypto from "crypto"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createInsertSchema } from "drizzle-zod";

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


