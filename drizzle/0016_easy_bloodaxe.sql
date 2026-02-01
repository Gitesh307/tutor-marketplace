ALTER TABLE `email_settings` DROP FOREIGN KEY `email_settings_updatedBy_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `email_settings` MODIFY COLUMN `footerText` text NOT NULL;