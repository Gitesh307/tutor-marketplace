import { drizzle } from "drizzle-orm/mysql2";
import { users, tutorProfiles, courses } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const sampleTutors = [
  {
    openId: "tutor-sarah-math",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@tutorconnect.demo",
    role: "tutor",
    profile: {
      bio: "Passionate mathematics educator with over 15 years of experience helping students excel in algebra, calculus, and statistics. I believe every student can master math with the right approach and encouragement.",
      subjects: JSON.stringify(["Mathematics", "Algebra", "Calculus", "Statistics", "Geometry"]),
      gradeLevels: JSON.stringify(["Middle School", "High School", "College"]),
      qualifications: "PhD in Mathematics Education, MIT; Master's in Applied Mathematics, Stanford University",
      hourlyRate: "75.00",
      yearsOfExperience: 15,
      availability: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
    },
    courses: [
      {
        title: "Advanced Calculus Mastery",
        description: "Comprehensive calculus course covering limits, derivatives, integrals, and applications. Perfect for high school AP students and college freshmen.",
        subject: "Mathematics",
        gradeLevel: "High School",
        price: "399.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 16,
      },
      {
        title: "Algebra Foundations",
        description: "Build a solid foundation in algebra with clear explanations and plenty of practice. Ideal for middle and high school students.",
        subject: "Mathematics",
        gradeLevel: "Middle School",
        price: "299.99",
        duration: 45,
        sessionsPerWeek: 2,
        totalSessions: 12,
      },
    ],
  },
  {
    openId: "tutor-james-science",
    name: "James Chen",
    email: "james.chen@tutorconnect.demo",
    role: "tutor",
    profile: {
      bio: "Experienced science tutor specializing in physics, chemistry, and biology. I make complex scientific concepts accessible and engaging through real-world examples and hands-on problem solving.",
      subjects: JSON.stringify(["Physics", "Chemistry", "Biology", "General Science"]),
      gradeLevels: JSON.stringify(["Middle School", "High School", "College"]),
      qualifications: "MS in Physics, UC Berkeley; BS in Chemistry, UCLA; Certified Science Teacher",
      hourlyRate: "65.00",
      yearsOfExperience: 10,
      availability: JSON.stringify(["Monday", "Wednesday", "Thursday", "Saturday"]),
    },
    courses: [
      {
        title: "Physics for High Achievers",
        description: "Master mechanics, electricity, magnetism, and waves. Includes problem-solving strategies for AP Physics and college entrance exams.",
        subject: "Physics",
        gradeLevel: "High School",
        price: "449.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 20,
      },
      {
        title: "Chemistry Fundamentals",
        description: "Explore atomic structure, chemical reactions, stoichiometry, and more. Perfect preparation for standardized tests.",
        subject: "Chemistry",
        gradeLevel: "High School",
        price: "349.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 15,
      },
    ],
  },
  {
    openId: "tutor-emily-english",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@tutorconnect.demo",
    role: "tutor",
    profile: {
      bio: "Award-winning English teacher dedicated to developing strong reading, writing, and critical thinking skills. I help students find their voice and express themselves with confidence.",
      subjects: JSON.stringify(["English", "Literature", "Writing", "Reading Comprehension", "Essay Writing"]),
      gradeLevels: JSON.stringify(["Elementary", "Middle School", "High School"]),
      qualifications: "MA in English Literature, Columbia University; BA in Creative Writing, NYU; Published Author",
      hourlyRate: "60.00",
      yearsOfExperience: 12,
      availability: JSON.stringify(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
    },
    courses: [
      {
        title: "Essay Writing Excellence",
        description: "Master the art of persuasive and analytical writing. Learn to craft compelling essays for school assignments and college applications.",
        subject: "English",
        gradeLevel: "High School",
        price: "329.99",
        duration: 60,
        sessionsPerWeek: 1,
        totalSessions: 12,
      },
      {
        title: "Reading Comprehension Boost",
        description: "Develop critical reading skills and analytical thinking. Perfect for standardized test preparation and academic success.",
        subject: "English",
        gradeLevel: "Middle School",
        price: "279.99",
        duration: 45,
        sessionsPerWeek: 2,
        totalSessions: 10,
      },
    ],
  },
  {
    openId: "tutor-michael-cs",
    name: "Michael Park",
    email: "michael.park@tutorconnect.demo",
    role: "tutor",
    profile: {
      bio: "Software engineer turned educator with a passion for teaching coding and computer science. I make programming fun and accessible for beginners while challenging advanced students.",
      subjects: JSON.stringify(["Computer Science", "Python", "JavaScript", "Web Development", "Data Structures"]),
      gradeLevels: JSON.stringify(["Middle School", "High School", "College"]),
      qualifications: "BS in Computer Science, Carnegie Mellon; 8 years industry experience at Google and Microsoft",
      hourlyRate: "85.00",
      yearsOfExperience: 8,
      availability: JSON.stringify(["Monday", "Tuesday", "Friday", "Saturday", "Sunday"]),
    },
    courses: [
      {
        title: "Python Programming for Beginners",
        description: "Learn Python from scratch with hands-on projects. Build games, automate tasks, and create your first web applications.",
        subject: "Computer Science",
        gradeLevel: "High School",
        price: "499.99",
        duration: 90,
        sessionsPerWeek: 2,
        totalSessions: 16,
      },
      {
        title: "Web Development Bootcamp",
        description: "Master HTML, CSS, JavaScript, and React. Build real-world websites and launch your web development career.",
        subject: "Computer Science",
        gradeLevel: "College",
        price: "599.99",
        duration: 90,
        sessionsPerWeek: 2,
        totalSessions: 20,
      },
    ],
  },
  {
    openId: "tutor-lisa-languages",
    name: "Lisa Martinez",
    email: "lisa.martinez@tutorconnect.demo",
    role: "tutor",
    profile: {
      bio: "Native Spanish speaker and certified language instructor. I create immersive, conversational lessons that make learning Spanish natural and enjoyable.",
      subjects: JSON.stringify(["Spanish", "French", "Language Arts", "ESL"]),
      gradeLevels: JSON.stringify(["Elementary", "Middle School", "High School", "Adult"]),
      qualifications: "MA in Foreign Language Education, University of Barcelona; DELE Examiner Certification",
      hourlyRate: "55.00",
      yearsOfExperience: 9,
      availability: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
    },
    courses: [
      {
        title: "Conversational Spanish",
        description: "Develop fluency through real conversations and cultural immersion. Perfect for travelers and students preparing for study abroad.",
        subject: "Spanish",
        gradeLevel: "High School",
        price: "349.99",
        duration: 60,
        sessionsPerWeek: 2,
        totalSessions: 16,
      },
      {
        title: "Spanish for Beginners",
        description: "Start your Spanish journey with a solid foundation in grammar, vocabulary, and pronunciation. Interactive and fun!",
        subject: "Spanish",
        gradeLevel: "Middle School",
        price: "289.99",
        duration: 45,
        sessionsPerWeek: 2,
        totalSessions: 12,
      },
    ],
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    for (const tutorData of sampleTutors) {
      console.log(`\n📝 Creating tutor: ${tutorData.name}`);

      // Insert user
      const userResult = await db.insert(users).values({
        openId: tutorData.openId,
        name: tutorData.name,
        email: tutorData.email,
        loginMethod: "demo",
        role: tutorData.role,
      });

      const userId = Number(userResult[0].insertId);
      console.log(`✅ User created with ID: ${userId}`);

      // Insert tutor profile
      const profileResult = await db.insert(tutorProfiles).values({
        userId: userId,
        ...tutorData.profile,
      });

      console.log(`✅ Tutor profile created`);

      // Insert courses
      for (const courseData of tutorData.courses) {
        await db.insert(courses).values({
          tutorId: userId,
          ...courseData,
        });
        console.log(`  📚 Course created: ${courseData.title}`);
      }
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - ${sampleTutors.length} tutors created`);
    console.log(`   - ${sampleTutors.reduce((sum, t) => sum + t.courses.length, 0)} courses created`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log("\n🎉 Seeding process finished!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding process failed:", error);
    process.exit(1);
  });
