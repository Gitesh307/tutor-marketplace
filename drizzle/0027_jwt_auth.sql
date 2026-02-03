-- Add email auth columns
ALTER TABLE `users`
  MODIFY `email` varchar(320) NOT NULL,
  ADD COLUMN `passwordHash` varchar(255) NOT NULL AFTER `email`,
  ADD COLUMN `firstName` varchar(100) NOT NULL AFTER `passwordHash`,
  ADD COLUMN `lastName` varchar(100) NOT NULL AFTER `firstName`,
  ADD COLUMN `userType` enum('parent','tutor','admin') NOT NULL DEFAULT 'parent' AFTER `role`;

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- Refresh token rotation table
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `revokedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `refresh_tokens_userId_idx` (`userId`),
  CONSTRAINT `refresh_tokens_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
