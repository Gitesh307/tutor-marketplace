CREATE TABLE `tutorPayoutRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutorId` int NOT NULL,
	`subscriptionId` int NOT NULL,
	`sessionsCompleted` int NOT NULL,
	`ratePerSession` decimal(10,2) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutorPayoutRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tutorPayoutRequests` ADD CONSTRAINT `tutorPayoutRequests_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tutorPayoutRequests` ADD CONSTRAINT `tutorPayoutRequests_subscriptionId_subscriptions_id_fk` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tutorPayoutRequests_tutorId_idx` ON `tutorPayoutRequests` (`tutorId`);--> statement-breakpoint
CREATE INDEX `tutorPayoutRequests_subscriptionId_idx` ON `tutorPayoutRequests` (`subscriptionId`);