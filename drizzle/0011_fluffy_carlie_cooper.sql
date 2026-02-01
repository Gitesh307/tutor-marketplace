CREATE TABLE `tutor_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutor_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tutor_availability` ADD CONSTRAINT `tutor_availability_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tutor_availability_tutorId_idx` ON `tutor_availability` (`tutorId`);--> statement-breakpoint
CREATE INDEX `tutor_availability_dayOfWeek_idx` ON `tutor_availability` (`dayOfWeek`);