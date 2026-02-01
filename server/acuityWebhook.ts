/**
 * Acuity Scheduling Webhook Handler
 * 
 * Handles incoming webhooks from Acuity Scheduling to sync appointments
 * to the local database.
 * 
 * Webhook events: https://developers.acuityscheduling.com/reference/webhooks
 */

import type { Request, Response } from "express";
import * as db from "./db";
import { getAppointment } from "./acuity";
import { sendBookingConfirmationEmail, sendTutorBookingNotification, BookingConfirmationData } from "./emailService";
import { generateBookingToken } from "./booking-management";

/**
 * Acuity webhook event types
 */
type AcuityWebhookEvent = {
  id: number;
  action: "scheduled" | "rescheduled" | "canceled" | "changed";
  appointmentTypeID: number;
  calendarID: number;
  datetime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  price: string;
  priceSold: string;
  paid: string;
  amountPaid: string;
  type: string;
  appointmentType: string;
  calendar: string;
  certificate?: string;
  confirmationPage?: string;
  formsText?: string;
  notes?: string;
  timezone?: string;
  calendarTimezone?: string;
  time?: string;
  endTime?: string;
  dateCreated?: string;
  datetimeCreated?: string;
  canceled?: boolean;
  canClientCancel?: boolean;
  canClientReschedule?: boolean;
  labels?: Array<{ id: number; name: string; color: string }>;
  forms?: Array<{
    id: number;
    name: string;
    values: Array<{ value: string; name: string; fieldID: number }>;
  }>;
};

/**
 * Process Acuity webhook event
 */
export async function handleAcuityWebhook(req: Request, res: Response) {
  try {
    const event: AcuityWebhookEvent = req.body;
    
    console.log(`[Acuity Webhook] Received ${event.action} event for appointment #${event.id}`);
    
    // Get full appointment details from Acuity API
    const appointment = await getAppointment(event.id);
    
    // Extract custom fields to find subscription ID and student info
    let subscriptionId: number | null = null;
    let studentFirstName = "";
    let studentLastName = "";
    
    if (appointment.forms && appointment.forms.length > 0) {
      for (const form of appointment.forms) {
        for (const field of form.values) {
          if (field.name.toLowerCase().includes("subscription") || field.name.toLowerCase().includes("enrollment")) {
            subscriptionId = parseInt(field.value);
          }
          if (field.name.toLowerCase().includes("student") && field.name.toLowerCase().includes("first")) {
            studentFirstName = field.value;
          }
          if (field.name.toLowerCase().includes("student") && field.name.toLowerCase().includes("last")) {
            studentLastName = field.value;
          }
        }
      }
    }
    
    // Parse datetime
    const scheduledAt = new Date(appointment.datetime).getTime();
    const duration = appointment.duration || 60; // Default to 60 minutes
    
    // Find parent by email
    const users = await db.getAllUsers();
    const parent = users.find(u => u.email === appointment.email && u.role === "parent");
    
    if (!parent) {
      console.warn(`[Acuity Webhook] Parent not found for email: ${appointment.email}`);
      return res.json({ received: true, warning: "Parent not found" });
    }
    
    // If no subscription ID provided, try to find active subscription for this parent
    if (!subscriptionId) {
      const subscriptions = await db.getSubscriptionsByParentId(parent.id);
      const activeSubscription = subscriptions.find(s => s.subscription.status === "active");
      if (activeSubscription) {
        subscriptionId = activeSubscription.subscription.id;
      }
    }
    
    if (!subscriptionId) {
      console.warn(`[Acuity Webhook] No subscription found for parent ${parent.id}`);
      return res.json({ received: true, warning: "No subscription found" });
    }
    
    // Get subscription to find tutor
    const subscription = await db.getSubscriptionById(subscriptionId);
    if (!subscription) {
      console.warn(`[Acuity Webhook] Subscription ${subscriptionId} not found`);
      return res.json({ received: true, warning: "Subscription not found" });
    }
    
    // Get tutor from course
    const course = await db.getCourseById(subscription.courseId);
    if (!course) {
      console.warn(`[Acuity Webhook] Course ${subscription.courseId} not found`);
      return res.json({ received: true, warning: "Course not found" });
    }
    
    const tutors = await db.getTutorsForCourse(course.id);
    const primaryTutor = tutors.find(t => t.isPrimary);
    if (!primaryTutor) {
      console.warn(`[Acuity Webhook] No primary tutor found for course ${course.id}`);
      return res.json({ received: true, warning: "No tutor found" });
    }
    
    // Handle different event actions
    switch (event.action) {
      case "scheduled":
        // Create new session
        // Generate management token for email-based booking management
        const managementToken = generateBookingToken();

        const sessionId = await db.createSession({
          subscriptionId,
          tutorId: primaryTutor.tutorId,
          parentId: parent.id,
          scheduledAt,
          duration,
          status: "scheduled",
          notes: appointment.notes || "",
          acuityAppointmentId: appointment.id,
          managementToken,
        });
        
        console.log(`[Acuity Webhook] Created session #${sessionId} for appointment #${appointment.id}`);
        
        // Send booking confirmation email
        const tutor = await db.getUserById(primaryTutor.tutorId);
        const emailData: BookingConfirmationData = {
          parentEmail: parent.email || "",
          parentName: parent.name || "Parent",
          studentName: studentFirstName && studentLastName ? `${studentFirstName} ${studentLastName}` : "Student",
          courseName: course.title,
          tutorName: tutor?.name || "Tutor",
          tutorEmail: tutor?.email || undefined,
          sessionDate: new Date(scheduledAt),
          sessionDuration: duration,
          sessionNotes: appointment.notes,
          acuityAppointmentId: appointment.id.toString(),
          managementToken,
        };
        
        // Send confirmation email to parent
        const parentEmailSent = await sendBookingConfirmationEmail(emailData);
        if (parentEmailSent) {
          console.log(`[Acuity Webhook] Sent confirmation email to parent: ${parent.email}`);
        } else {
          console.warn(`[Acuity Webhook] Failed to send confirmation email to parent: ${parent.email}`);
        }
        
        // Send notification email to tutor
        const tutorEmailSent = await sendTutorBookingNotification(emailData);
        if (tutorEmailSent) {
          console.log(`[Acuity Webhook] Sent notification email to tutor: ${tutor?.email}`);
        } else {
          console.warn(`[Acuity Webhook] Failed to send notification email to tutor`);
        }
        break;
        
      case "rescheduled":
        // Update existing session
        const existingSessions = await db.getSessionsByParentId(parent.id);
        const sessionToUpdate = existingSessions.find(s => s.acuityAppointmentId === appointment.id);
        
        if (sessionToUpdate) {
          await db.updateSession(sessionToUpdate.id, {
            scheduledAt,
            duration,
          });
          console.log(`[Acuity Webhook] Rescheduled session #${sessionToUpdate.id}`);
        }
        break;
        
      case "canceled":
        // Cancel session
        const sessions = await db.getSessionsByParentId(parent.id);
        const sessionToCancel = sessions.find(s => s.acuityAppointmentId === appointment.id);
        
        if (sessionToCancel) {
          await db.updateSession(sessionToCancel.id, {
            status: "cancelled",
          });
          console.log(`[Acuity Webhook] Cancelled session #${sessionToCancel.id}`);
        }
        break;
        
      case "changed":
        // Handle other changes
        const allSessions = await db.getSessionsByParentId(parent.id);
        const sessionToChange = allSessions.find(s => s.acuityAppointmentId === appointment.id);
        
        if (sessionToChange) {
          await db.updateSession(sessionToChange.id, {
            scheduledAt,
            duration,
            notes: appointment.notes || sessionToChange.notes,
          });
          console.log(`[Acuity Webhook] Updated session #${sessionToChange.id}`);
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error("[Acuity Webhook] Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
}
