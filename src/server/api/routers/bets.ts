import z from "zod";
import { drizzle, type MySqlQueryResult } from "drizzle-orm/mysql2";
import * as schema from "~/db/schema"
import mysql from "mysql2/promise";
import { sql } from 'drizzle-orm'
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { auth } from "@clerk/nextjs";

const OneToManyBetSchema = z.array(
  z.object({
    numbersPicked: z.array(z.number()),
    wagerAmount: z.number(),
    odds: z.number(),
  })
);

type LastInsertType = Array<LastInsertID>
type LastInsertID = Record<"insertedTicketNum" | "gameNumber", number>

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection, { schema, mode: "planetscale" });

const insertBetsSchema = createInsertSchema(schema.bets);
const selectBetsSchema = createSelectSchema(schema.bets);


export const betsRouter = createTRPCRouter({
    placeBet: publicProcedure
    .input(z.object({data: OneToManyBetSchema, gameNumber: z.number(), cashier_id: z.string(), totalWager: z.number(), picked_list: z.array(z.number())}))
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const insertedTicketNum: MySqlQueryResult = await tx.execute(sql.raw(`SELECT LAST_INSERT_ID() AS insertedTicketNum`));
        const insertTicketNum: LastInsertType = insertedTicketNum[0] as LastInsertType;
        const insertID: LastInsertID = insertTicketNum[0]!;

        const createBets = input.data.map(async (bet) => {
          await tx.insert(schema.bets).values({
            ticket_number: insertID.insertedTicketNum,
            wager_amount: bet.wagerAmount,
            game_number: input.gameNumber,
            numbers_picked: bet.numbersPicked.length,
            picked_list: JSON.stringify(bet.numbersPicked),
          });
        });
        return { insertedTicketNum, createBets };
      });
    }),


  getAllBets: publicProcedure.query(async () => {
    const result = await db.query.bets.findMany({
      limit: 20,
    });
    return result;
  }),

  getBetByTicketNumber: publicProcedure
    .input(z.object({ ticket_number: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(schema.bets)
        .where(eq(schema.bets.bet_id, input.ticket_number));

      return result;
    }),

  updateBetByTicketNumber: publicProcedure
    .input(z.object({ ticketNumber: z.number(), data: insertBetsSchema }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(schema.bets)
        .set(input.data)
        .where(eq(schema.bets.bet_id, input.ticketNumber));

      return result;
    }),

  getAllDraws: publicProcedure.query(async () => {
    const result = await db.query.draws.findMany({
      limit: 10,
    });

    return result;
  }),

  deleteBetByTicketNumber: publicProcedure
    .input(z.object({ ticketNumber: z.number() }))
    .mutation(async ({ input }) => {
      const deletedRow = await db
        .select()
        .from(schema.bets)
        .where(eq(schema.bets.bet_id, input.ticketNumber));
      const insertIntoCancelled = await db
        .insert(schema.cancelledBets)
        .values(deletedRow);
      const result = await db
        .delete(schema.bets)
        .where(eq(schema.bets.bet_id, input.ticketNumber));

      // TODO: Add this row to cancelled bets
      return deletedRow;
    }),
});
