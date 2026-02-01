import { drizzle } from "drizzle-orm/mysql2";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

async function migrate() {
  console.log("🔄 Starting migration to multi-tutor courses...\n");

  try {
    // Step 1: Create course_tutors junction table
    console.log("Step 1: Creating course_tutors junction table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_tutors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courseId INT NOT NULL,
        tutorId INT NOT NULL,
        isPrimary BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (tutorId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX course_tutors_courseId_idx (courseId),
        INDEX course_tutors_tutorId_idx (tutorId),
        UNIQUE KEY course_tutors_unique (courseId, tutorId)
      )
    `);
    console.log("✅ Junction table created\n");

    // Step 2: Migrate existing course-tutor relationships
    console.log("Step 2: Migrating existing course-tutor relationships...");
    const result = await db.execute(`
      INSERT INTO course_tutors (courseId, tutorId, isPrimary)
      SELECT id, tutorId, TRUE
      FROM courses
      WHERE tutorId IS NOT NULL
      ON DUPLICATE KEY UPDATE isPrimary = TRUE
    `);
    console.log(`✅ Migrated ${result[0].affectedRows} course-tutor relationships\n`);

    // Step 3: Drop tutorId column from courses table
    console.log("Step 3: Removing tutorId column from courses table...");
    await db.execute(`
      ALTER TABLE courses DROP FOREIGN KEY courses_tutorId_users_id_fk
    `);
    await db.execute(`
      ALTER TABLE courses DROP INDEX courses_tutorId_idx
    `);
    await db.execute(`
      ALTER TABLE courses DROP COLUMN tutorId
    `);
    console.log("✅ tutorId column removed\n");

    console.log("🎉 Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   - Created course_tutors junction table");
    console.log("   - Migrated existing relationships");
    console.log("   - Removed tutorId from courses table");
    console.log("   - Courses now support multiple tutors!");

  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\nPlease review the error and try again.");
    process.exit(1);
  }

  process.exit(0);
}

migrate();
