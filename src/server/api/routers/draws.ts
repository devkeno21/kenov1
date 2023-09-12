import z from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../../../drizzle/schema";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";

import { Draw, NewDraw, draws } from "~/db/schema";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { DrawSchema, NewDrawSchema } from "~/zod-types";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection, { schema, mode: "planetscale" });

export const drawsRouter = createTRPCRouter({
  createDraw: publicProcedure
    .input(z.object({ data: DrawSchema }))
    .query(async ({ input }) => {
      return await db.insert(draws).values(input.data);
      // console.log(NewBet);
    }),

  

  getAllDraws: publicProcedure.query(async () => {
    const result = await db.query.draws.findMany({
      limit: 20,
    });
    return result;
  }),

  getDrawByGameNumber: publicProcedure
    .input(z.object({ game_number: z.number() }))
    .query(async ({ input }) => {
      const result = await db.query.draws.findMany({
        where: eq(draws.game_number, input.game_number),
      });
      return result;
    }),

  updateDrawByGamenumber: publicProcedure
    .input(z.object({ game_number: z.number(), data: NewDrawSchema }))
    .query(async ({ input }) => {
      const result = await db
        .update(draws)
        .set(input.data)
        .where(eq(draws.game_number, input.game_number));
      return result;
    }),

  deleteDrawByGamenumber: publicProcedure
    .input(z.object({ game_number: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .delete(draws)
        .where(eq(draws.game_number, input.game_number));
      return result;
    }),
});
