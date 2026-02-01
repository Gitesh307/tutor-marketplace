CREATE TABLE `tutor_time_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`startTime` bigint NOT NULL,
	`endTime` bigint NOT NULL,
	`reason` varchar(255),
	`acuityBlockId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutor_time_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tutor_time_blocks` ADD CONSTRAINT `tutor_time_blocks_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tutor_time_blocks_tutorId_idx` ON `tutor_time_blocks` (`tutorId`);--> statement-breakpoint
CREATE INDEX `tutor_time_blocks_startTime_idx` ON `tutor_time_blocks` (`startTime`);