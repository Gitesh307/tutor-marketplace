import { drizzle } from "drizzle-orm/mysql2";
import { tutorProfiles } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

// Sample availability patterns for different tutors
const availabilityPatterns = [
  // Pattern 1: Morning person (Dr. Sarah Johnson)
  {
    monday: ["09:00-12:00", "14:00-17:00"],
    tuesday: ["09:00-12:00", "14:00-17:00"],
    wednesday: ["09:00-12:00"],
    thursday: ["09:00-12:00", "14:00-17:00"],
    friday: ["09:00-12:00", "14:00-17:00"],
    saturday: ["10:00-13:00"],
    sunday: [],
  },
  // Pattern 2: Afternoon/Evening (James Chen)
  {
    monday: ["15:00-20:00"],
    tuesday: ["15:00-20:00"],
    wednesday: ["15:00-20:00"],
    thursday: ["15:00-20:00"],
    friday: ["15:00-20:00"],
    saturday: ["09:00-12:00", "14:00-18:00"],
    sunday: ["14:00-18:00"],
  },
  // Pattern 3: Flexible schedule (Emily Rodriguez)
  {
    monday: ["10:00-13:00", "15:00-19:00"],
    tuesday: ["10:00-13:00", "15:00-19:00"],
    wednesday: ["10:00-13:00", "15:00-19:00"],
    thursday: ["10:00-13:00", "15:00-19:00"],
    friday: ["10:00-13:00", "15:00-19:00"],
    saturday: ["11:00-15:00"],
    sunday: [],
  },
  // Pattern 4: Evening specialist (Michael Park)
  {
    monday: ["17:00-21:00"],
    tuesday: ["17:00-21:00"],
    wednesday: ["17:00-21:00"],
    thursday: ["17:00-21:00"],
    friday: ["17:00-21:00"],
    saturday: ["10:00-14:00", "16:00-20:00"],
    sunday: ["10:00-14:00"],
  },
  // Pattern 5: Weekend warrior (Lisa Martinez)
  {
    monday: ["16:00-19:00"],
    tuesday: ["16:00-19:00"],
    wednesday: [],
    thursday: ["16:00-19:00"],
    friday: ["16:00-19:00"],
    saturday: ["09:00-13:00", "14:00-18:00"],
    sunday: ["09:00-13:00", "14:00-18:00"],
  },
];

async function addAvailability() {
  console.log("🗓️  Adding availability data to tutors...\n");

  try {
    // Get all tutor profiles
    const tutors = await db.select().from(tutorProfiles);
    console.log(`Found ${tutors.length} tutor profiles\n`);

    for (let i = 0; i < tutors.length; i++) {
      const tutor = tutors[i];
      const pattern = availabilityPatterns[i % availabilityPatterns.length];

      await db
        .update(tutorProfiles)
        .set({
          availability: JSON.stringify(pattern),
        })
        .where(eq(tutorProfiles.id, tutor.id));

      console.log(`✅ Updated availability for tutor ID ${tutor.id}`);
      console.log(`   Pattern: ${Object.keys(pattern).filter(day => pattern[day].length > 0).join(", ")}`);
    }

    console.log("\n✨ Successfully added availability data to all tutors!");
  } catch (error) {
    console.error("❌ Error adding availability:", error);
    throw error;
  }
}

addAvailability()
  .then(() => {
    console.log("\n🎉 Availability update complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to add availability:", error);
    process.exit(1);
  });
