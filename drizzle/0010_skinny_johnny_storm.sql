ALTER TABLE `subscriptions` ADD `paymentPlan` enum('full','installment') DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `firstInstallmentPaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `secondInstallmentPaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `firstInstallmentAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `secondInstallmentAmount` decimal(10,2);