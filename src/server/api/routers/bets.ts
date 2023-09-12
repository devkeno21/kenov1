import z from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../../../drizzle/schema";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";

import { Bet, NewBet, bets, users } from "~/db/schema";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { BetSchema, NewBetSchema } from "~/zod-types";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection, { schema, mode: "planetscale" });

export const betsRouter = createTRPCRouter({
  placeBet: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createBet: publicProcedure
    .input(z.object({ data: BetSchema }))
    .query(async ({ input }) => {
      return await db.insert(bets).values(input.data);
      // console.log(NewBet);
    }),

  //   getAllBets: publicProcedure.input(z.object({ ticket_number: z.string() })).query(async ({ input }) => {
  //     const result = await db.query.bets.findMany({
  //         limit: 20
  //     })
  //     return result
  //   })

  getAllBets: publicProcedure.query(async () => {
    const result = await db.query.bets.findMany({
      limit: 20,
    });
    return result;
  }),

  getBetByTicketNumber: publicProcedure
    .input(z.object({ ticket_number: z.number() }))
    .query(async ({ input }) => {
      const result = await db.query.bets.findMany({
        where: eq(bets.ticket_number, input.ticket_number),
      });
      return result;
    }),

  updateBetByTicketnumber: publicProcedure
    .input(z.object({ ticket_number: z.number(), data: NewBetSchema }))
    .query(async ({ input }) => {
      const result = await db
        .update(bets)
        .set(input.data)
        .where(eq(bets.ticket_number, input.ticket_number));
      return result;
    }),

  deleteBetByTicketnumber: publicProcedure
    .input(z.object({ ticket_number: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .delete(bets)
        .where(eq(bets.ticket_number, input.ticket_number));
      return result;
    }),
});
