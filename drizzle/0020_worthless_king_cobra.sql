CREATE TABLE `session_note_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionNoteId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_note_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session_note_attachments` ADD CONSTRAINT `session_note_attachments_sessionNoteId_session_notes_id_fk` FOREIGN KEY (`sessionNoteId`) REFERENCES `session_notes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_note_attachments` ADD CONSTRAINT `session_note_attachments_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `session_note_attachments_sessionNoteId_idx` ON `session_note_attachments` (`sessionNoteId`);