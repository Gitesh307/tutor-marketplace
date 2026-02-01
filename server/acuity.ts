/**
 * Acuity Scheduling API Integration
 * 
 * This module provides helper functions to interact with the Acuity Scheduling API.
 * API Documentation: https://developers.acuityscheduling.com/reference
 */

import { ACUITY_USER_ID, ACUITY_API_KEY } from "./_core/env";

const ACUITY_API_BASE = "https://acuityscheduling.com/api/v1";

/**
 * Make an authenticated request to the Acuity API
 */
async function makeAcuityRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const auth = Buffer.from(`${ACUITY_USER_ID}:${ACUITY_API_KEY}`).toString("base64");
  
  const response = await fetch(`${ACUITY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Acuity API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get account information to verify API credentials
 */
export async function getAcuityAccount() {
  return makeAcuityRequest("/me");
}

/**
 * Get all appointment types
 */
export async function getAppointmentTypes() {
  return makeAcuityRequest("/appointment-types");
}

/**
 * Get appointments within a date range
 */
export async function getAppointments(params?: {
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  appointmentTypeID?: number;
  calendarID?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.minDate) queryParams.append("minDate", params.minDate);
  if (params?.maxDate) queryParams.append("maxDate", params.maxDate);
  if (params?.appointmentTypeID) queryParams.append("appointmentTypeID", params.appointmentTypeID.toString());
  if (params?.calendarID) queryParams.append("calendarID", params.calendarID.toString());
  
  const query = queryParams.toString();
  return makeAcuityRequest(`/appointments${query ? `?${query}` : ""}`);
}

/**
 * Get a specific appointment by ID
 */
export async function getAppointment(appointmentId: number) {
  return makeAcuityRequest(`/appointments/${appointmentId}`);
}

/**
 * Get all calendars
 */
export async function getCalendars() {
  return makeAcuityRequest("/calendars");
}

/**
 * Get availability for a specific appointment type
 */
export async function getAvailability(params: {
  appointmentTypeID: number;
  month: string; // YYYY-MM
  calendarID?: number;
  timezone?: string;
}) {
  const queryParams = new URLSearchParams({
    appointmentTypeID: params.appointmentTypeID.toString(),
    month: params.month,
  });
  
  if (params.calendarID) queryParams.append("calendarID", params.calendarID.toString());
  if (params.timezone) queryParams.append("timezone", params.timezone);
  
  return makeAcuityRequest(`/availability/dates?${queryParams.toString()}`);
}

/**
 * Get available times for a specific date
 */
export async function getAvailableTimes(params: {
  appointmentTypeID: number;
  date: string; // YYYY-MM-DD
  calendarID?: number;
  timezone?: string;
}) {
  const queryParams = new URLSearchParams({
    appointmentTypeID: params.appointmentTypeID.toString(),
    date: params.date,
  });
  
  if (params.calendarID) queryParams.append("calendarID", params.calendarID.toString());
  if (params.timezone) queryParams.append("timezone", params.timezone);
  
  return makeAcuityRequest(`/availability/times?${queryParams.toString()}`);
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointment: {
  appointmentTypeID: number;
  datetime: string; // ISO 8601 format
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  fields?: Array<{ id: number; value: string }>;
  calendarID?: number;
}) {
  return makeAcuityRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: number) {
  return makeAcuityRequest(`/appointments/${appointmentId}/cancel`, {
    method: "PUT",
  });
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(appointmentId: number, datetime: string) {
  return makeAcuityRequest(`/appointments/${appointmentId}/reschedule`, {
    method: "PUT",
    body: JSON.stringify({ datetime }),
  });
}

/**
 * Get blocks (unavailable time slots)
 */
export async function getBlocks(params?: {
  minDate?: string;
  maxDate?: string;
  calendarID?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.minDate) queryParams.append("minDate", params.minDate);
  if (params?.maxDate) queryParams.append("maxDate", params.maxDate);
  if (params?.calendarID) queryParams.append("calendarID", params.calendarID.toString());
  
  const query = queryParams.toString();
  return makeAcuityRequest(`/blocks${query ? `?${query}` : ""}`);
}

/**
 * Create a block (mark time as unavailable)
 */
export async function createBlock(block: {
  calendarID: number;
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
  notes?: string;
}) {
  return makeAcuityRequest("/blocks", {
    method: "POST",
    body: JSON.stringify(block),
  });
}

/**
 * Delete a block
 */
export async function deleteBlock(blockId: number) {
  return makeAcuityRequest(`/blocks/${blockId}`, {
    method: "DELETE",
  });
}
