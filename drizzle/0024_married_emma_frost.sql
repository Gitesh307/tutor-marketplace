ALTER TABLE `tutor_profiles` ADD `approvalStatus` varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutor_profiles` ADD `rejectionReason` text;