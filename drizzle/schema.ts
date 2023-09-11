import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, serial, double, float, int, tinyint, timestamp, json, index, varchar } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const bets = mysqlTable("bets", {
	ticketNumber: serial("ticket_number").notNull(),
	wagerAmount: double("wager_amount"),
	odds: float("odds"),
	gameNumber: int("game_number"),
	hits: int("hits"),
	isReedeemed: tinyint("is_reedeemed"),
	reedeemedAmount: double("reedeemed_amount"),
	timestamp: timestamp("timestamp", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		betsTicketNumber: primaryKey(table.ticketNumber),
	}
});

export const draws = mysqlTable("draws", {
	gameNumber: serial("game_number").notNull(),
	numbersDrawn: json("numbers_drawn"),
	timestamp: timestamp("timestamp", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		drawsGameNumber: primaryKey(table.gameNumber),
	}
});

export const users = mysqlTable("users", {
	id: serial("id").notNull(),
	fullName: varchar("full_name", { length: 256 }),
},
(table) => {
	return {
		nameIdx: index("name_idx").on(table.fullName),
		usersId: primaryKey(table.id),
	}
});