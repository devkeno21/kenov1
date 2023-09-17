DROP INDEX `ticket_idx` ON `bets`;--> statement-breakpoint
DROP INDEX `game_idx` ON `draws`;--> statement-breakpoint
CREATE INDEX `ticket_time_idx` ON `bets` (`timestamp`);--> statement-breakpoint
CREATE INDEX `game_time_idx` ON `draws` (`timestamp`);