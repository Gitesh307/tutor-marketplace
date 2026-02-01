/**
 * CSV Export Utilities
 * Functions to convert data to CSV format for admin dashboard exports
 */

export function convertToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(',') + '\n';
  }

  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle dates
      if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      }
      
      // Handle strings with commas, quotes, or newlines
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

export function formatUsersForCSV(users: any[]) {
  return users.map(user => ({
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    role: user.role,
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
  }));
}

export function formatEnrollmentsForCSV(enrollments: any[]) {
  return enrollments.map(enrollment => ({
    id: enrollment.id,
    courseName: enrollment.courseName,
    studentName: enrollment.studentName,
    parentName: enrollment.parentName,
    parentEmail: enrollment.parentEmail,
    tutorName: enrollment.tutorName,
    status: enrollment.status,
    paymentStatus: enrollment.paymentStatus,
    paymentPlan: enrollment.paymentPlan || 'full',
    createdAt: new Date(enrollment.createdAt).toLocaleString(),
  }));
}

export function formatPaymentsForCSV(payments: any[]) {
  return payments.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency.toUpperCase(),
    status: payment.status,
    paymentType: payment.paymentType,
    courseName: payment.courseName || 'N/A',
    studentName: payment.studentName || 'N/A',
    parentName: payment.parentName,
    parentEmail: payment.parentEmail,
    tutorName: payment.tutorName,
    stripePaymentIntentId: payment.stripePaymentIntentId || '',
    createdAt: new Date(payment.createdAt).toLocaleString(),
  }));
}
