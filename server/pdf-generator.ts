import PDFDocument from 'pdfkit';
import type { Readable } from 'stream';

export interface CurriculumPDFData {
  courseTitle: string;
  subject: string;
  gradeLevel: string | null;
  tutorName: string;
  curriculum: string;
  price: string;
  duration: number | null;
  sessionsPerWeek: number | null;
  totalSessions: number | null;
}

export interface PaymentReceiptData {
  receiptNumber: string;
  paymentDate: Date;
  parentName: string;
  parentEmail: string | null;
  courseName: string;
  tutorName: string;
  studentName: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  paymentType: string;
  installmentInfo?: {
    installmentNumber: number;
    totalInstallments: number;
    remainingAmount: string;
  };
}

export function generatePaymentReceipt(data: PaymentReceiptData): Readable {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Header with Logo/Title
  doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af')
    .text('EdKonnect Academy', { align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor('black')
    .text('Payment Receipt', { align: 'center' });
  doc.moveDown(0.5);
  
  // Receipt Number and Date
  doc.fontSize(10).font('Helvetica')
    .text(`Receipt #: ${data.receiptNumber}`, { align: 'right' });
  doc.text(`Date: ${data.paymentDate.toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(1.5);

  // Divider line
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Bill To Section
  doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  doc.text(data.parentName);
  if (data.parentEmail) {
    doc.text(data.parentEmail);
  }
  doc.moveDown(1.5);

  // Payment Details
  doc.fontSize(12).font('Helvetica-Bold').text('Payment Details:');
  doc.moveDown(0.5);
  
  const detailsY = doc.y;
  doc.fontSize(10).font('Helvetica');
  
  // Left column labels
  doc.text('Course:', 50, detailsY);
  doc.text('Instructor:', 50, detailsY + 20);
  doc.text('Student:', 50, detailsY + 40);
  doc.text('Payment Method:', 50, detailsY + 60);
  if (data.transactionId) {
    doc.text('Transaction ID:', 50, detailsY + 80);
  }
  
  // Right column values
  doc.text(data.courseName, 200, detailsY);
  doc.text(data.tutorName, 200, detailsY + 20);
  doc.text(data.studentName, 200, detailsY + 40);
  doc.text(data.paymentMethod, 200, detailsY + 60);
  if (data.transactionId) {
    doc.text(data.transactionId, 200, detailsY + 80);
  }
  
  doc.y = detailsY + (data.transactionId ? 100 : 80);
  doc.moveDown(1.5);

  // Installment Info if applicable
  if (data.installmentInfo) {
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#d97706')
      .text('Installment Payment', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('black');
    doc.text(
      `Payment ${data.installmentInfo.installmentNumber} of ${data.installmentInfo.totalInstallments}`,
      { align: 'center' }
    );
    if (data.installmentInfo.remainingAmount !== '0.00') {
      doc.text(
        `Remaining Balance: $${data.installmentInfo.remainingAmount}`,
        { align: 'center' }
      );
    }
    doc.moveDown(1.5);
  }

  // Amount Section
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Amount Paid:', 50, doc.y);
  doc.fontSize(18).fillColor('#16a34a')
    .text(`$${data.amount} ${data.currency.toUpperCase()}`, { align: 'right' });
  doc.fillColor('black');
  doc.moveDown(0.5);
  
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(2);

  // Footer
  doc.fontSize(9).font('Helvetica').fillColor('gray');
  doc.text('Thank you for choosing EdKonnect Academy!', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(8)
    .text('This is an official receipt for your payment.', { align: 'center' });
  doc.text('For questions, please contact support@edkonnect.com', { align: 'center' });
  
  // Add page number at bottom
  doc.text(
    `Page 1 of 1`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );

  doc.end();
  
  return doc as unknown as Readable;
}

export function generateCurriculumPDF(data: CurriculumPDFData): Readable {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('Course Curriculum', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(18).font('Helvetica').text(data.courseTitle, { align: 'center' });
  doc.moveDown(1.5);

  // Course Information
  doc.fontSize(12).font('Helvetica-Bold').text('Course Information', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica');
  doc.text(`Subject: ${data.subject}`);
  if (data.gradeLevel) {
    doc.text(`Grade Level: ${data.gradeLevel}`);
  }
  doc.text(`Instructor: ${data.tutorName}`);
  doc.text(`Price: $${data.price}`);
  
  if (data.duration) {
    doc.text(`Session Duration: ${data.duration} minutes`);
  }
  if (data.sessionsPerWeek) {
    doc.text(`Sessions Per Week: ${data.sessionsPerWeek}`);
  }
  if (data.totalSessions) {
    doc.text(`Total Sessions: ${data.totalSessions}`);
  }
  
  doc.moveDown(1.5);

  // Curriculum Content
  doc.fontSize(12).font('Helvetica-Bold').text('Curriculum Details', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica');
  
  // Split curriculum by lines and format
  const lines = data.curriculum.split('\n');
  lines.forEach((line) => {
    if (line.trim() === '') {
      doc.moveDown(0.5);
    } else if (line.startsWith('Week ') || line.startsWith('Module ')) {
      // Headers
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text(line.trim());
      doc.font('Helvetica');
    } else if (line.trim().startsWith('•')) {
      // Bullet points
      doc.text(`  ${line.trim()}`, { indent: 10 });
    } else {
      // Regular text
      doc.text(line.trim());
    }
  });

  // Footer
  doc.moveDown(2);
  doc.fontSize(8).font('Helvetica').fillColor('gray')
    .text('Generated by EdKonnect Academy', { align: 'center' });
  doc.text(new Date().toLocaleDateString(), { align: 'center' });

  doc.end();
  
  return doc as unknown as Readable;
}
