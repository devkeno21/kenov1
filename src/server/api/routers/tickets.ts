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
        const ticket = await tx.query.tickets.findFirst({
          where: eq(schema.tickets.ticket_number, input.ticket_number),
        });
        if (!ticket) throw new Error("Ticket not found. Can't be redeemed.");
        //   get all bets associated with the ticket
        const bets = await tx
          .select()
          .from(schema.bets)
          .where(eq(schema.bets.ticket_number, input.ticket_number));

        // get total redeemed and total wager
        const total = bets.reduce(
          (acc, curr) => {
            acc.wager += curr.wager_amount;
            acc.redeemed += curr.reedeemed_amount ? curr.reedeemed_amount : 0;
            return acc;
          },
          { wager: 0, redeemed: 0 },
        );

        // update query
        const newTicket = {
          ...ticket,
          total_wager: total.wager,
          total_redeemed: total.redeemed,
        };

        await tx
          .update(schema.tickets)
          .set({
            ...newTicket,
            status: newTicket.total_redeemed > 0 ? "WON" : "LOST",
            is_redeemed: true,
          })
          .where(eq(schema.tickets.ticket_number, input.ticket_number));

        // return the new ticket
        return await tx.query.tickets.findFirst({
          where: eq(schema.tickets.ticket_number, input.ticket_number),
        });
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
        const ticket = await tx.query.tickets.findFirst({
          where: eq(schema.tickets.ticket_number, input.ticket_num),
        });
        if (!ticket) throw new Error("Ticket not found");

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
              // update the tickets status to CANCELLED
              await tx
                .update(schema.tickets)
                .set({ ...ticket, status: "CANCELLED" });
        
              // return cancelled ticket
              return await tx.query.tickets.findFirst({
                where: eq(schema.tickets.ticket_number, input.ticket_num),
              });
              
              // //   add ticket to cancelled tickets
              // await tx.insert(schema.cancelledTickets).values(ticket);
              // // remove the ticket from tickets table
              // await tx
              //   .delete(schema.tickets)
              //   .where(eq(schema.tickets.ticket_number, input.ticket_num));
            });
          } else {
            return "You can't cancel on passed game";
          }
        }
      });
    }),
});
