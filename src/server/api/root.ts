import { createTRPCRouter } from "~/server/api/trpc";
import { betsRouter } from "./routers/bets";
import { drawsRouter } from "./routers/draws";
import { ticketsRouter } from "./routers/tickets";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tickets: ticketsRouter,
  bets: betsRouter,
  draws: drawsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
