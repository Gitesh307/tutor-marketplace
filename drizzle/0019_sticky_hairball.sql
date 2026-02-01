CREATE TABLE `session_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`tutorId` int NOT NULL,
	`parentId` int NOT NULL,
	`progressSummary` text NOT NULL,
	`homework` text,
	`challenges` text,
	`nextSteps` text,
	`parentNotified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_parentId_users_id_fk` FOREIGN KEY (`parentId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `session_notes_sessionId_idx` ON `session_notes` (`sessionId`);--> statement-breakpoint
CREATE INDEX `session_notes_tutorId_idx` ON `session_notes` (`tutorId`);--> statement-breakpoint
CREATE INDEX `session_notes_parentId_idx` ON `session_notes` (`parentId`);