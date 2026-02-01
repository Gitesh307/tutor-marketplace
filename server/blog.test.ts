import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { drizzle } from "drizzle-orm/mysql2";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

// Mock context for public procedures
const mockPublicContext = {
  user: null,
  req: {} as any,
  res: {} as any,
} as Context;

describe("Blog Posts API", () => {
  beforeAll(async () => {
    // Ensure we have test data
    const existingPosts = await db.select().from(blogPosts).limit(1);
    if (existingPosts.length === 0) {
      // Seed test blog post if none exists
      await db.insert(blogPosts).values({
        title: "Test Blog Post",
        slug: "test-blog-post",
        excerpt: "This is a test blog post excerpt",
        content: "This is the full content of the test blog post.",
        category: "Test",
        tags: JSON.stringify(["test"]),
        readTime: 5,
        isPublished: true,
        publishedAt: new Date(),
        displayOrder: 999,
      });
    }
  });

  describe("home.blogPosts", () => {
    it("should return list of published blog posts", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const result = await caller.home.blogPosts();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of first blog post
      const post = result[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("excerpt");
      expect(post).toHaveProperty("content");
      expect(post.isPublished).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const result = await caller.home.blogPosts({ limit: 2 });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("should return empty array when no published posts exist", async () => {
      // Temporarily unpublish all posts
      await db.update(blogPosts).set({ isPublished: false });

      const caller = appRouter.createCaller(mockPublicContext);
      const result = await caller.home.blogPosts();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);

      // Restore published status
      await db.update(blogPosts).set({ isPublished: true });
    });
  });

  describe("home.blogPost", () => {
    it("should return a specific blog post by slug", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      
      // Get first available post slug
      const posts = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).limit(1);
      expect(posts.length).toBeGreaterThan(0);
      
      const slug = posts[0].slug;
      const result = await caller.home.blogPost({ slug });

      expect(result).toBeDefined();
      expect(result.slug).toBe(slug);
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("content");
      expect(result.isPublished).toBe(true);
    });

    it("should throw NOT_FOUND error for non-existent slug", async () => {
      const caller = appRouter.createCaller(mockPublicContext);

      await expect(
        caller.home.blogPost({ slug: "non-existent-slug-12345" })
      ).rejects.toThrow();
    });

    it("should not return unpublished posts", async () => {
      // Create an unpublished post
      const unpublishedSlug = "unpublished-test-post";
      await db.insert(blogPosts).values({
        title: "Unpublished Post",
        slug: unpublishedSlug,
        excerpt: "This should not be accessible",
        content: "Content",
        isPublished: false,
        displayOrder: 999,
      });

      const caller = appRouter.createCaller(mockPublicContext);

      await expect(
        caller.home.blogPost({ slug: unpublishedSlug })
      ).rejects.toThrow();

      // Cleanup
      await db.delete(blogPosts).where(eq(blogPosts.slug, unpublishedSlug));
    });
  });

  describe("Blog Post Data Integrity", () => {
    it("should have all required fields", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const posts = await caller.home.blogPosts({ limit: 1 });

      expect(posts.length).toBeGreaterThan(0);
      const post = posts[0];

      // Required fields
      expect(post.title).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.content).toBeTruthy();
      expect(typeof post.isPublished).toBe("boolean");
      expect(typeof post.displayOrder).toBe("number");
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toBeInstanceOf(Date);
    });

    it("should have valid read time if present", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const posts = await caller.home.blogPosts();

      posts.forEach(post => {
        if (post.readTime !== null) {
          expect(typeof post.readTime).toBe("number");
          expect(post.readTime).toBeGreaterThan(0);
        }
      });
    });
  });
});
