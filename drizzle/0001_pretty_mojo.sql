CREATE TABLE `cancelledBets` (
	`cancelled_id` serial AUTO_INCREMENT NOT NULL,
	`ticket_number` serial AUTO_INCREMENT,
	`wager_amount` double,
	`odds` float,
	`game_number` int,
	`hits` int,
	`is_reedeemed` boolean,
	`reedeemed_amount` double,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `cancelledBets_cancelled_id` PRIMARY KEY(`cancelled_id`)
);
