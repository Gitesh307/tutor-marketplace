-- Align courses table with current schema (course_tutors handles tutor linkage)
ALTER TABLE `courses` DROP FOREIGN KEY `courses_tutorId_users_id_fk`;--> statement-breakpoint
ALTER TABLE `courses` DROP INDEX `courses_tutorId_idx`;--> statement-breakpoint
ALTER TABLE `courses` DROP COLUMN `tutorId`;--> statement-breakpoint
