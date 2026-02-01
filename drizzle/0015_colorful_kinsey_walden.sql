CREATE TABLE `email_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logoUrl` text,
	`primaryColor` varchar(7) NOT NULL DEFAULT '#667eea',
	`accentColor` varchar(7) NOT NULL DEFAULT '#764ba2',
	`footerText` text DEFAULT ('EdKonnect Academy - Connecting Students with Expert Tutors'),
	`companyName` varchar(255) NOT NULL DEFAULT 'EdKonnect Academy',
	`supportEmail` varchar(320) DEFAULT 'support@edkonnect.com',
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `email_settings` ADD CONSTRAINT `email_settings_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;