CREATE TABLE `acuity_mapping_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`acuityAppointmentTypeId` int NOT NULL,
	`acuityCalendarId` int NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acuity_mapping_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `acuity_mapping_templates` ADD CONSTRAINT `acuity_mapping_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;