import { relations } from "drizzle-orm";
import {
  boolean,
  double,
  float,
  index,
  int,
  json,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

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
  },
  (draws) => ({
    gameIdx: index("game_idx").on(draws.game_number),
  }),
);

export type Draw = typeof draws.$inferSelect; // return type when queried
export type NewDraw = typeof draws.$inferInsert; // insert type

// One to many relation between draws and bets.
export const drawsRelation = relations(draws, ({many}) => ({
  bets: many(bets)
}))

export const bets = mysqlTable(
  "bets",
  {
    ticket_number: serial("ticket_number").primaryKey(),
    wager_amount: double("wager_amount"),
    odds: float("odds"),
    game_number: int("game_number"),
    hits: int("hits"),
    is_reedeemed: boolean("is_reedeemed"),
    reedeemed_amount: double("reedeemed_amount"),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (bets) => ({
    ticketIdx: index("ticket_idx").on(bets.ticket_number),
  }),
);

export type Bet = typeof bets.$inferSelect; // return type when queried
export type NewBet = typeof bets.$inferInsert; // insert type

// One to many relation between draws and bets.
export const betsRelation = relations(bets, ({one}) => ({
  draw: one(draws, {
    fields: [bets.game_number],
    references: [draws.game_number]
  })
}))


export const cancelledBets = mysqlTable("cancelledBets", {
  cancelled_id: serial("cancelled_id").primaryKey(),
  ticket_number: serial("ticket_number"),
  wager_amount: double("wager_amount"),
  odds: float("odds"),
  game_number: int("game_number"),
  hits: int("hits"),
  is_reedeemed: boolean("is_reedeemed"),
  reedeemed_amount: double("reedeemed_amount"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type CancelledBet = typeof cancelledBets.$inferSelect; // return type when queried
export type NewCancelledBet = typeof cancelledBets.$inferInsert; // insert type

// One to One relations between bets and cancelled bets => betsRelation

export const cancelledBetsRelation = relations(bets, ({ one }) => ({
  cancelledBets: one(cancelledBets, {
    fields: [bets.ticket_number],
    references: [cancelledBets.ticket_number],
  }),
}));
