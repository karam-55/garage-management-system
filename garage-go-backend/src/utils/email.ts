import nodemailer from 'nodemailer';
import { Logger } from './logger';

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      path: string;
    }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      Logger.info('Email sent successfully', { messageId: info.messageId, to: options.to });
      return true;
    } catch (error) {
      Logger.error('Failed to send email', error);
      return false;
    }
  }

  // Template methods for different email types
  public async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const subject = 'Welcome to Garage Go!';
    const html = `
      <h2>Welcome to Garage Go, ${fullName}!</h2>
      <p>Thank you for registering with our garage management system.</p>
      <p>You can now start booking appointments and managing your vehicles.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async sendBookingConfirmationEmail(
    email: string,
    fullName: string,
    garageName: string,
    serviceTitle: string,
    scheduledAt: Date
  ): Promise<boolean> {
    const subject = 'Booking Confirmation - Garage Go';
    const formattedDate = scheduledAt.toLocaleString();
    
    const html = `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${fullName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Garage:</strong> ${garageName}</li>
        <li><strong>Service:</strong> ${serviceTitle}</li>
        <li><strong>Date & Time:</strong> ${formattedDate}</li>
      </ul>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async sendBookingReminderEmail(
    email: string,
    fullName: string,
    garageName: string,
    serviceTitle: string,
    scheduledAt: Date
  ): Promise<boolean> {
    const subject = 'Booking Reminder - Garage Go';
    const formattedDate = scheduledAt.toLocaleString();
    
    const html = `
      <h2>Booking Reminder</h2>
      <p>Dear ${fullName},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <ul>
        <li><strong>Garage:</strong> ${garageName}</li>
        <li><strong>Service:</strong> ${serviceTitle}</li>
        <li><strong>Date & Time:</strong> ${formattedDate}</li>
      </ul>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async sendInvoiceEmail(
    email: string,
    fullName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ): Promise<boolean> {
    const subject = `Invoice ${invoiceNumber} - Garage Go`;
    const formattedDueDate = dueDate.toLocaleDateString();
    
    const html = `
      <h2>Invoice ${invoiceNumber}</h2>
      <p>Dear ${fullName},</p>
      <p>Your invoice is ready:</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${invoiceNumber}</li>
        <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Due Date:</strong> ${formattedDueDate}</li>
      </ul>
      <p>Please pay the invoice before the due date to avoid any late fees.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset - Garage Go';
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your Garage Go account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async sendGarageApprovalEmail(email: string, garageName: string): Promise<boolean> {
    const subject = 'Garage Approved - Garage Go';
    
    const html = `
      <h2>Congratulations! Your Garage Has Been Approved</h2>
      <p>Dear Garage Owner,</p>
      <p>Your garage "${garageName}" has been approved and is now live on our platform.</p>
      <p>You can now start receiving bookings from customers.</p>
      <p>Best regards,<br/>The Garage Go Team</p>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      Logger.info('Email service connection successful');
      return true;
    } catch (error) {
      Logger.error('Email service connection failed', error);
      return false;
    }
  }
}

export { EmailService };
