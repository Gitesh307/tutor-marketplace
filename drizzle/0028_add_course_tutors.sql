CREATE TABLE `course_tutors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `courseId` int NOT NULL,
  `tutorId` int NOT NULL,
  `isPrimary` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `course_tutors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `course_tutors` ADD CONSTRAINT `course_tutors_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_tutors` ADD CONSTRAINT `course_tutors_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `course_tutors_courseId_idx` ON `course_tutors` (`courseId`);--> statement-breakpoint
CREATE INDEX `course_tutors_tutorId_idx` ON `course_tutors` (`tutorId`);--> statement-breakpoint
CREATE INDEX `course_tutors_unique` ON `course_tutors` (`courseId`,`tutorId`);
