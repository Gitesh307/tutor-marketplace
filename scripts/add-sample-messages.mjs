import { drizzle } from "drizzle-orm/mysql2";
import { users, conversations, messages } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function addSampleMessages() {
  console.log("💬 Adding sample messages...\n");

  try {
    // Find Arun Siva (the owner/first user)
    const arunResult = await db.select().from(users).where(eq(users.name, "Arun Siva")).limit(1);
    
    if (arunResult.length === 0) {
      console.log("❌ Could not find Arun Siva in the database");
      return;
    }

    const arun = arunResult[0];
    console.log(`✅ Found Arun Siva (ID: ${arun.id})`);

    // Check if sample parent user already exists
    let parentId;
    const existingParent = await db.select().from(users).where(eq(users.openId, "demo-parent-001")).limit(1);
    
    if (existingParent.length > 0) {
      parentId = existingParent[0].id;
      console.log(`✅ Found existing sample parent: Sarah Mitchell (ID: ${parentId})`);
    } else {
      // Create a sample parent user
      const parentResult = await db.insert(users).values({
        openId: "demo-parent-001",
        name: "Sarah Mitchell",
        email: "sarah.mitchell@example.com",
        loginMethod: "demo",
        role: "parent",
      });
      parentId = Number(parentResult[0].insertId);
      console.log(`✅ Created sample parent: Sarah Mitchell (ID: ${parentId})`);
    }

    // Create a conversation between the parent and Arun
    const conversationResult = await db.insert(conversations).values({
      parentId: parentId,
      tutorId: arun.id,
      lastMessageAt: Date.now(), // Unix timestamp in milliseconds
    });

    const conversationId = Number(conversationResult[0].insertId);
    console.log(`✅ Created conversation (ID: ${conversationId})`);

    // Add sample messages
    const now = Date.now();
    const sampleMessages = [
      {
        conversationId,
        senderId: parentId,
        content: "Hi! I saw your profile and I'm interested in math tutoring for my daughter. She's in 10th grade and struggling with calculus. Are you available for sessions on weekday evenings?",
        sentAt: now - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
      {
        conversationId,
        senderId: arun.id,
        content: "Hello Sarah! Thank you for reaching out. I'd be happy to help your daughter with calculus. I have availability on Monday, Tuesday, and Thursday evenings from 5pm to 8pm. Would any of those times work for you?",
        sentAt: now - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000, // 2 days ago + 30 min
      },
      {
        conversationId,
        senderId: parentId,
        content: "That's perfect! Tuesday evenings at 6pm would work great for us. What's the next step? Should I enroll in one of your courses?",
        sentAt: now - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      },
      {
        conversationId,
        senderId: arun.id,
        content: "Wonderful! Yes, you can enroll in my 'Advanced Calculus Mastery' course which includes weekly one-on-one sessions. Once you're enrolled, we can schedule our first session for next Tuesday. I'll prepare a diagnostic assessment to understand her current level and areas that need focus.",
        sentAt: now - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000, // 1 day ago + 2 hours
      },
      {
        conversationId,
        senderId: parentId,
        content: "Great! I've just enrolled in the course. Looking forward to the first session. Should my daughter prepare anything specific?",
        sentAt: now - 12 * 60 * 60 * 1000, // 12 hours ago
      },
      {
        conversationId,
        senderId: arun.id,
        content: "Perfect! Just have her bring any recent calculus homework or tests, and a notebook. I'll send you a Zoom link before our session on Tuesday. See you then!",
        sentAt: now - 10 * 60 * 60 * 1000, // 10 hours ago
      },
    ];

    for (const message of sampleMessages) {
      await db.insert(messages).values(message);
      const sender = message.senderId === parentId ? "Sarah" : "Arun";
      console.log(`  📨 Added message from ${sender}`);
    }

    // Update conversation's lastMessageAt to the most recent message
    await db
      .update(conversations)
      .set({ lastMessageAt: sampleMessages[sampleMessages.length - 1].sentAt })
      .where(eq(conversations.id, conversationId));

    console.log("\n✨ Successfully added sample conversation and messages!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Conversation between Sarah Mitchell and Arun Siva`);
    console.log(`   - ${sampleMessages.length} messages exchanged`);
    console.log(`   - Topic: Calculus tutoring inquiry and enrollment`);
  } catch (error) {
    console.error("❌ Error adding sample messages:", error);
    throw error;
  }
}

addSampleMessages()
  .then(() => {
    console.log("\n🎉 Sample messages added successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to add sample messages:", error);
    process.exit(1);
  });
