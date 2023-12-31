import { relations } from "drizzle-orm";
import {
  boolean,
  double,
  float,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { number } from "zod";

export const users = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 256 }),
  },
  (users) => ({
    nameIdx: index("name_idx").on(users.fullName),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// export const authOtps = mysqlTable('auth_otp', {
//   id: serial('id').primaryKey(),
//   phone: varchar('phone', { length: 256 }),
//   userId: int('user_id').references(() => users.id),
// });

export const draws = mysqlTable(
  "draws",
  {
    game_number: serial("game_number").primaryKey(),
    numbers_drawn: json("numbers_drawn"),
    timestamp: timestamp("timestamp").defaultNow(),
    premature: boolean("premature").notNull().default(true)
  },
  (draws) => ({
    gameIdx: index("game_time_idx").on(draws.timestamp),
  }),
);

export type Draw = typeof draws.$inferSelect; // return type when queried
export type NewDraw = typeof draws.$inferInsert; // insert type

// One to many relation between draws and bets.
export const drawsRelation = relations(draws, ({ many }) => ({
  bets: many(bets),
}));

export const bets = mysqlTable(
  "bets",
  {
    bet_id: serial("bet_id").primaryKey(),
    ticket_number: int("ticket_number").notNull(),
    wager_amount: double("wager_amount").notNull(),
    game_number: int("game_number").notNull(),
    numbers_picked: int("numbers_picked").notNull(),
    picked_list: json("picked_list").notNull(),
    hits: int("hits"),
    reedeemed_amount: double("reedeemed_amount"),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (bets) => ({
    ticketIdx: index("ticket_time_idx").on(bets.timestamp),
  }),
);

export type Bet = typeof bets.$inferSelect; // return type when queried
export type NewBet = typeof bets.$inferInsert; // insert type

// One to many relation between draws and bets.
export const betsDrawsRelation = relations(bets, ({ one }) => ({
  draw: one(draws, {
    fields: [bets.game_number],
    references: [draws.game_number],
  }),
}));

// One to many relation between tickets and bets.
export const betsTicketsRelations = relations(bets, ({ one }) => ({
  ticket: one(tickets, {
    fields: [bets.ticket_number],
    references: [tickets.ticket_number],
  }),
}));

// One to Many relation between bets and cancelled Ticekts
export const betsCancelledRelations = relations(bets, ({ one }) => ({
	cancelledTickets: one(cancelledTickets, {
		fields: [bets.ticket_number],
		references: [cancelledTickets.ticket_number],
	}),
}));

export const tickets = mysqlTable("tickets", {
  ticket_number: serial("ticket_number").primaryKey(),
  cashier_id: varchar("cashier_id", { length: 256 }).notNull(),
  picked_list: json("picked_list").notNull(),
  total_wager: double("total_wager").notNull(),
  total_redeemed: double("total_redeemed"),
  status: mysqlEnum("status", ['LOST', 'WON', 'UNDETERMINED', 'CANCELLED']).default('UNDETERMINED'),
  is_redeemed: boolean("is_reedeemed").$default(()=>false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type Tickets = typeof tickets.$inferSelect; // return type when queried
export type NewTickets = typeof tickets.$inferInsert; // insert type

// One to many relation between tickets and bets.
export const ticketsRelation = relations(tickets, ({ many }) => ({
  bets: many(bets),
}));

export const cancelledTickets = mysqlTable("cancelledTickets", {
  cancelled_id: serial("cancelled_id").primaryKey(),
  ticket_number: int("ticket_number").unique(),
  cashier_id: varchar("cashier_id", { length: 256 }).notNull(),
  picked_list: json("picked_list").notNull(),
  total_wager: double("total_wager").notNull(),
  total_redeemed: double("total_redeemed"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type CancelledBet = typeof cancelledTickets.$inferSelect; // return type when queried
export type NewCancelledBet = typeof cancelledTickets.$inferInsert; // insert type

// One to One relations between tickets and cancelled Tickets => cancelledTicketsRelation
export const cancelledTicketsRelation = relations(tickets, ({ one }) => ({
  cancelledTickets: one(cancelledTickets, {
    fields: [tickets.ticket_number],
    references: [cancelledTickets.ticket_number],
  }),
}));


// One to Many relation between bets and cancelled Ticekts
export const cancelledTicketsBetsRelations = relations(cancelledTickets, ({ many }) => ({
	cancelledBets: many(bets),
}));