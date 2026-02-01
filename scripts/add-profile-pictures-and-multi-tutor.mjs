import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

// Sample profile picture URLs from UI Avatars
const profilePictures = {
  "Arun Siva": "https://ui-avatars.com/api/?name=Arun+Siva&background=4F46E5&color=fff&size=200",
  "Dr. Emily Chen": "https://ui-avatars.com/api/?name=Emily+Chen&background=059669&color=fff&size=200",
  "Prof. Michael Rodriguez": "https://ui-avatars.com/api/?name=Michael+Rodriguez&background=DC2626&color=fff&size=200",
  "Sarah Thompson": "https://ui-avatars.com/api/?name=Sarah+Thompson&background=7C3AED&color=fff&size=200",
  "James Wilson": "https://ui-avatars.com/api/?name=James+Wilson&background=EA580C&color=fff&size=200",
};

async function addProfilePicturesAndMultiTutor() {
  console.log("🎨 Adding profile pictures and multi-tutor courses...\n");

  try {
    // Step 1: Add profile pictures to tutors
    console.log("Step 1: Adding profile pictures to tutor profiles...");
    
    for (const [name, pictureUrl] of Object.entries(profilePictures)) {
      await db.execute(`
        UPDATE tutor_profiles tp
        INNER JOIN users u ON tp.userId = u.id
        SET tp.profileImageUrl = '${pictureUrl}'
        WHERE u.name = '${name}'
      `);
      console.log(`  ✓ Added profile picture for ${name}`);
    }
    
    console.log("✅ Profile pictures added\n");

    // Step 2: Create a multi-tutor course
    console.log("Step 2: Creating multi-tutor course...");
    
    // Get Arun Siva and Dr. Emily Chen user IDs
    const arunResult = await db.execute(`
      SELECT id FROM users WHERE name = 'Arun Siva' LIMIT 1
    `);
    const emilyResult = await db.execute(`
      SELECT id FROM users WHERE name = 'Dr. Emily Chen' LIMIT 1
    `);
    
    if (arunResult[0].length > 0 && emilyResult[0].length > 0) {
      const arunId = arunResult[0][0].id;
      const emilyId = emilyResult[0][0].id;
      
      // Create a new course
      const courseResult = await db.execute(`
        INSERT INTO courses (title, description, subject, gradeLevel, price, duration, sessionsPerWeek, totalSessions, isActive)
        VALUES (
          'Advanced Data Science & Machine Learning',
          'Comprehensive course covering data science fundamentals, machine learning algorithms, and real-world applications. Taught by two experienced instructors with complementary expertise in mathematics and computer science.',
          'Computer Science',
          'College',
          '89.99',
          90,
          2,
          24,
          true
        )
      `);
      
      const courseId = courseResult[0].insertId;
      console.log(`  ✓ Created course with ID: ${courseId}`);
      
      // Add both tutors to the course
      await db.execute(`
        INSERT INTO course_tutors (courseId, tutorId, isPrimary)
        VALUES (${courseId}, ${arunId}, true)
      `);
      console.log(`  ✓ Added Arun Siva as primary tutor`);
      
      await db.execute(`
        INSERT INTO course_tutors (courseId, tutorId, isPrimary)
        VALUES (${courseId}, ${emilyId}, false)
      `);
      console.log(`  ✓ Added Dr. Emily Chen as co-tutor`);
      
      console.log("✅ Multi-tutor course created\n");
    } else {
      console.log("⚠️  Could not find required tutors\n");
    }

    console.log("🎉 Sample data updated successfully!");
    console.log("\n📊 Summary:");
    console.log("   - Added profile pictures to 5 tutors");
    console.log("   - Created 1 course with multiple tutors");
    console.log("   - Ready to display in UI!");

  } catch (error) {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

addProfilePicturesAndMultiTutor();
