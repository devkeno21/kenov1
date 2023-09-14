import z from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../../../../drizzle/schema";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createInsertSchema } from "drizzle-zod";

// import { Draw, NewDraw, draws } from "~/db/schema";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const DrawSchema = createInsertSchema(schema.draws);

const db = drizzle(connection, { schema, mode: "planetscale" });

export const drawsRouter = createTRPCRouter({
  createDraw: publicProcedure
    .input(z.object({ data: DrawSchema }))
    .query(async ({ input }) => {
      return await db.insert(schema.draws).values(input.data);
      // console.log(NewBet);
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
      const result = await db.query.draws.findMany({
        where: eq(schema.draws.gameNumber, input.gameNumber),
      });
      return result;
    }),

  updateDrawByGamenumber: publicProcedure
    .input(z.object({ gameNumber: z.number(), data: DrawSchema }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(schema.draws)
        .set(input.data)
        .where(eq(schema.draws.gameNumber, input.gameNumber));
      return result;
    }),

  deleteDrawByGamenumber: publicProcedure
    .input(z.object({ gameNumber: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .delete(schema.draws)
        .where(eq(schema.draws.gameNumber, input.gameNumber));
      return result;
    }),
});