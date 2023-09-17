import z from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../../../drizzle/schema";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection, { schema, mode: "planetscale" });

const insertBetsSchema = createInsertSchema(schema.bets);
const selectBetsSchema = createSelectSchema(schema.bets);

export const betsRouter = createTRPCRouter({
  placeBet: publicProcedure
    .input(z.object({ data: insertBetsSchema }))
    .mutation(async ({ input }) => {
      const placeBet = await db.insert(schema.bets).values(input.data);

      return placeBet;
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
        .where(eq(schema.bets.ticketNumber, input.ticket_number));

      return result;
    }),

  updateBetByTicketNumber: publicProcedure
    .input(z.object({ ticketNumber: z.number(), data: insertBetsSchema }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(schema.bets)
        .set(input.data)
        .where(eq(schema.bets.ticketNumber, input.ticketNumber));

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
        .where(eq(schema.bets.ticketNumber, input.ticketNumber));
      const insertIntoCancelled = await db
        .insert(schema.cancelledBets)
        .values(deletedRow);
      const result = await db
        .delete(schema.bets)
        .where(eq(schema.bets.ticketNumber, input.ticketNumber));

      // TODO: Add this row to cancelled bets
      return deletedRow;
    }),
});
