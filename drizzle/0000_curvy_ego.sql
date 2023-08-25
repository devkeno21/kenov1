CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `users` (`full_name`);