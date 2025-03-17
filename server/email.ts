import nodemailer from 'nodemailer';

// Create a test SMTP service for development
let testAccount: nodemailer.TestAccount | null = null;
let transporter: nodemailer.Transporter;

// Initialize email transport
export const initEmailTransport = async () => {
  // If we're in production, use real email service
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // For development, use ethereal.email
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Test email account created:', testAccount.user);
  }
};

// Email functions
export const sendProjectPostedEmail = async (to: string, projectTitle: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"TechConnect" <noreply@techconnect.com>',
      to,
      subject: `New Project Posted: ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Project Posted</h2>
          <p>A new project titled <strong>${projectTitle}</strong> has been posted on TechConnect.</p>
          <p>Log in to your account to view the details and submit a proposal.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
             style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
            View Project
          </a>
        </div>
      `,
    });

    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendProposalReceivedEmail = async (to: string, projectTitle: string, sellerName: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"TechConnect" <noreply@techconnect.com>',
      to,
      subject: `New Proposal for ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Proposal Received</h2>
          <p>You've received a new proposal for <strong>${projectTitle}</strong> from <strong>${sellerName}</strong>.</p>
          <p>Log in to your account to review the proposal details.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
             style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
            Review Proposal
          </a>
        </div>
      `,
    });

    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendPaymentProcessedEmail = async (to: string, projectTitle: string, amount: number) => {
  try {
    const info = await transporter.sendMail({
      from: '"TechConnect" <noreply@techconnect.com>',
      to,
      subject: `Payment Processed for ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Payment Processed</h2>
          <p>A payment of <strong>$${amount.toFixed(2)}</strong> has been processed for the project <strong>${projectTitle}</strong>.</p>
          <p>Log in to your account to view payment details.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
             style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
            View Payment
          </a>
        </div>
      `,
    });

    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendMessageNotificationEmail = async (to: string, senderName: string, projectTitle: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"TechConnect" <noreply@techconnect.com>',
      to,
      subject: `New Message Regarding ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Message</h2>
          <p>You have received a new message from <strong>${senderName}</strong> regarding the project <strong>${projectTitle}</strong>.</p>
          <p>Log in to your account to view and respond to the message.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
             style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
            View Message
          </a>
        </div>
      `,
    });

    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
