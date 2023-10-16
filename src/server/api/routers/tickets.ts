import z, { number } from "zod";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "~/db/schema";
import mysql from "mysql2/promise";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { getWinningsFromOdds } from "~/utils/odds";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { json } from "stream/consumers";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection, { schema, mode: "planetscale" });

const insertTicketsSchema = createInsertSchema(schema.tickets);
const selectTicketsSchema = createSelectSchema(schema.tickets);

export const ticketsRouter = createTRPCRouter({
  placeTicket: publicProcedure
    .input(z.object({ data: insertTicketsSchema }))
    .mutation(async ({ input }) => {
      //insert values
      await db.insert(schema.tickets).values(input.data);

      //get last ticket number
      const inserted_ticekt_num = (await db.execute(
        sql`SELECT LAST_INSERT_ID() AS inserted_ticket_num`,
      )) as unknown as number;

      return inserted_ticekt_num;
    }),

  redeemTicket: publicProcedure
    .input(z.object({ ticket_number: z.number() }))
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        const ticket = await tx
          .select()
          .from(schema.tickets)
          .where(eq(schema.tickets.ticket_number, input.ticket_number));

        //   get bets associated with the ticket
        const bets = await tx
          .select()
          .from(schema.bets)
          .where(eq(schema.bets.ticket_number, input.ticket_number));

        const updatedBets = bets.map(async (bet) => {
          const draw = await tx
            .select()
            .from(schema.draws)
            .where(eq(schema.draws.game_number, bet.game_number));

          // numbers drawn from draw and picked list from bet
          const numbersDrawn = JSON.parse(
            draw[0]?.numbers_drawn as string,
          ) as number[];
          const numbersPickedByBet = JSON.parse(
            bet.picked_list as string,
          ) as number[];
          //   get hits
          const hits = numbersDrawn.filter((number) =>
            numbersPickedByBet.includes(number),
          ).length;
          const winning = getWinningsFromOdds(numbersPickedByBet.length, hits);
          const newBet = {
            ...bet,
            hits: hits,
            redeemed_amount:
              winning === undefined ? 0 : winning * bet.wager_amount,
          };
          //   update both the bets and tickets table using newBet
          await tx
            .update(schema.bets)
            .set(newBet)
            .where(eq(schema.bets.bet_id, newBet.bet_id));
          await tx
            .update(schema.tickets)
            .set({
              total_wager:
                ticket[0]?.total_wager == undefined
                  ? newBet.wager_amount
                  : ticket[0]?.total_wager + newBet.wager_amount,
              total_redeemed:
                ticket[0]?.total_redeemed == undefined
                  ? newBet.redeemed_amount
                  : ticket[0]?.total_redeemed + newBet.redeemed_amount,
            })
            .where(eq(schema.tickets.ticket_number, newBet.bet_id));
          return newBet;
        });
        const updatedTicket = await tx
          .select()
          .from(schema.tickets)
          .where(eq(schema.tickets.ticket_number, input.ticket_number));

        //   return both the updated ticket object and the list of all the updated bets,
        return { updatedTicket, updatedBets };
      });
    }),

  getTicketByTicketNumber: publicProcedure
    .input(z.object({ ticket_num: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(schema.bets)
        .where(eq(schema.bets.ticket_number, input.ticket_num));

      return result;
    }),

  updateTicketByTicketNumber: publicProcedure
    .input(z.object({ ticket_num: z.number(), data: insertTicketsSchema }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(schema.tickets)
        .set(input.data)
        .where(eq(schema.tickets.ticket_number, input.ticket_num));

      // it doesnt return the row with returning()
      return result;
    }),

  cancelTicketByTicketNumber: publicProcedure
    .input(z.object({ ticket_num: z.number() }))
    .query(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // select ticket by ticket number
        const ticket = await tx
          .select()
          .from(schema.tickets)
          .where(eq(schema.tickets.ticket_number, input.ticket_num));

        // get all bets by ticketNumber
        const bets = await tx
          .select()
          .from(schema.bets)
          .where(eq(schema.bets.ticket_number, input.ticket_num));

        // check the draw before cancelling
        if (bets[0]?.game_number !== undefined) {
          const draw = await tx
            .select()
            .from(schema.draws)
            .where(eq(schema.draws.game_number, bets[0]?.game_number));

          // check for passed game
          if (draw === null) {
            return await tx.transaction(async (tx) => {
              //   add ticket to cancelled tickets
              await tx.insert(schema.cancelledTickets).values(ticket);
              // remove the ticket from tickets table
              await tx
                .delete(schema.tickets)
                .where(eq(schema.tickets.ticket_number, input.ticket_num));
              return ticket;
            });
          } else {
            return "You can't cancel on passed game";
          }
        }
      });
    }),
});
