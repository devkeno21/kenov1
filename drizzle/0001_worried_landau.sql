CREATE TABLE `cancelledBets` (
	`cancelled_id` serial AUTO_INCREMENT NOT NULL,
	`ticket_number` int,
	`wager_amount` double,
	`odds` float,
	`game_number` int,
	`hits` int,
	`is_reedeemed` boolean,
	`reedeemed_amount` double,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `cancelledBets_cancelled_id` PRIMARY KEY(`cancelled_id`)
);
--> statement-breakpoint
DROP INDEX `game_idx` ON `draws`;--> statement-breakpoint
CREATE INDEX `ticket_time_idx` ON `bets` (`timestamp`);--> statement-breakpoint
CREATE INDEX `game_time_idx` ON `draws` (`timestamp`);