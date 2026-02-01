/**
 * Tests for home page data API endpoints
 */

import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Home Page Data API', () => {
  describe('Platform Stats', () => {
    it('should fetch platform statistics from database', async () => {
      const stats = await db.getPlatformStats();
      
      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
      
      // Verify structure of first stat
      const firstStat = stats[0];
      expect(firstStat).toHaveProperty('id');
      expect(firstStat).toHaveProperty('label');
      expect(firstStat).toHaveProperty('value');
      expect(firstStat).toHaveProperty('description');
      expect(firstStat).toHaveProperty('isActive');
    });

    it('should return stats in correct display order', async () => {
      const stats = await db.getPlatformStats();
      
      // Verify stats are ordered by displayOrder
      for (let i = 1; i < stats.length; i++) {
        expect(stats[i].displayOrder).toBeGreaterThanOrEqual(stats[i - 1].displayOrder);
      }
    });

    it('should only return active stats', async () => {
      const stats = await db.getPlatformStats();
      
      stats.forEach(stat => {
        expect(stat.isActive).toBe(true);
      });
    });
  });

  describe('Featured Courses', () => {
    it('should fetch featured courses from database', async () => {
      const courses = await db.getFeaturedCourses();
      
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
      
      // Verify structure of first course
      const firstCourse = courses[0];
      expect(firstCourse).toHaveProperty('id');
      expect(firstCourse).toHaveProperty('title');
      expect(firstCourse).toHaveProperty('description');
      expect(firstCourse).toHaveProperty('icon');
      expect(firstCourse).toHaveProperty('priceFrom');
      expect(firstCourse).toHaveProperty('isActive');
    });

    it('should return courses in correct display order', async () => {
      const courses = await db.getFeaturedCourses();
      
      // Verify courses are ordered by displayOrder
      for (let i = 1; i < courses.length; i++) {
        expect(courses[i].displayOrder).toBeGreaterThanOrEqual(courses[i - 1].displayOrder);
      }
    });

    it('should only return active courses', async () => {
      const courses = await db.getFeaturedCourses();
      
      courses.forEach(course => {
        expect(course.isActive).toBe(true);
      });
    });

    it('should have valid price format', async () => {
      const courses = await db.getFeaturedCourses();
      
      courses.forEach(course => {
        const price = parseFloat(course.priceFrom);
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(1000); // Reasonable upper limit
      });
    });
  });

  describe('Testimonials', () => {
    it('should fetch testimonials from database', async () => {
      const testimonials = await db.getTestimonials();
      
      expect(testimonials).toBeDefined();
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
      
      // Verify structure of first testimonial
      const firstTestimonial = testimonials[0];
      expect(firstTestimonial).toHaveProperty('id');
      expect(firstTestimonial).toHaveProperty('parentName');
      expect(firstTestimonial).toHaveProperty('parentInitials');
      expect(firstTestimonial).toHaveProperty('parentRole');
      expect(firstTestimonial).toHaveProperty('content');
      expect(firstTestimonial).toHaveProperty('rating');
      expect(firstTestimonial).toHaveProperty('isActive');
    });

    it('should return testimonials in correct display order', async () => {
      const testimonials = await db.getTestimonials();
      
      // Verify testimonials are ordered by displayOrder
      for (let i = 1; i < testimonials.length; i++) {
        expect(testimonials[i].displayOrder).toBeGreaterThanOrEqual(testimonials[i - 1].displayOrder);
      }
    });

    it('should only return active testimonials', async () => {
      const testimonials = await db.getTestimonials();
      
      testimonials.forEach(testimonial => {
        expect(testimonial.isActive).toBe(true);
      });
    });

    it('should have valid ratings', async () => {
      const testimonials = await db.getTestimonials();
      
      testimonials.forEach(testimonial => {
        expect(testimonial.rating).toBeGreaterThanOrEqual(1);
        expect(testimonial.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('FAQs', () => {
    it('should fetch FAQs from database', async () => {
      const faqs = await db.getFaqs();
      
      expect(faqs).toBeDefined();
      expect(Array.isArray(faqs)).toBe(true);
      expect(faqs.length).toBeGreaterThan(0);
      
      // Verify structure of first FAQ
      const firstFaq = faqs[0];
      expect(firstFaq).toHaveProperty('id');
      expect(firstFaq).toHaveProperty('question');
      expect(firstFaq).toHaveProperty('answer');
      expect(firstFaq).toHaveProperty('isActive');
    });

    it('should return FAQs in correct display order', async () => {
      const faqs = await db.getFaqs();
      
      // Verify FAQs are ordered by displayOrder
      for (let i = 1; i < faqs.length; i++) {
        expect(faqs[i].displayOrder).toBeGreaterThanOrEqual(faqs[i - 1].displayOrder);
      }
    });

    it('should only return active FAQs', async () => {
      const faqs = await db.getFaqs();
      
      faqs.forEach(faq => {
        expect(faq.isActive).toBe(true);
      });
    });

    it('should have non-empty questions and answers', async () => {
      const faqs = await db.getFaqs();
      
      faqs.forEach(faq => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.question.length).toBeGreaterThan(5);
        expect(faq.answer.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have at least 4 platform stats', async () => {
      const stats = await db.getPlatformStats();
      expect(stats.length).toBeGreaterThanOrEqual(4);
    });

    it('should have at least 4 featured courses', async () => {
      const courses = await db.getFeaturedCourses();
      expect(courses.length).toBeGreaterThanOrEqual(4);
    });

    it('should have at least 3 testimonials', async () => {
      const testimonials = await db.getTestimonials();
      expect(testimonials.length).toBeGreaterThanOrEqual(3);
    });

    it('should have at least 6 FAQs', async () => {
      const faqs = await db.getFaqs();
      expect(faqs.length).toBeGreaterThanOrEqual(6);
    });
  });
});
