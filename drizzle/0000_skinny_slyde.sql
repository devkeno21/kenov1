CREATE TABLE `bets` (
	`ticket_number` serial AUTO_INCREMENT NOT NULL,
	`wager_amount` double,
	`odds` float,
	`game_number` int,
	`hits` int,
	`is_reedeemed` boolean,
	`reedeemed_amount` double,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `bets_ticket_number` PRIMARY KEY(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `draws` (
	`game_number` serial AUTO_INCREMENT NOT NULL,
	`numbers_drawn` json,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `draws_game_number` PRIMARY KEY(`game_number`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `users` (`full_name`);