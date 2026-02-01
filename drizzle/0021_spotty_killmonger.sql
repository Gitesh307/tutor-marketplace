CREATE TABLE `tutor_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`parentId` int NOT NULL,
	`sessionId` int,
	`rating` int NOT NULL,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutor_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tutor_reviews` ADD CONSTRAINT `tutor_reviews_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tutor_reviews` ADD CONSTRAINT `tutor_reviews_parentId_users_id_fk` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tutor_reviews` ADD CONSTRAINT `tutor_reviews_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tutor_reviews_tutorId_idx` ON `tutor_reviews` (`tutorId`);--> statement-breakpoint
CREATE INDEX `tutor_reviews_parentId_idx` ON `tutor_reviews` (`parentId`);