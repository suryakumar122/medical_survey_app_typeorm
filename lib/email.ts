import nodemailer from "nodemailer";

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { to, subject, html, from = process.env.EMAIL_FROM || "noreply@medicalsurvey.com" } = options;
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendActivationEmail = async (email: string, name: string, activationLink: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Welcome to Medical Survey Platform</h2>
      <p>Hello ${name},</p>
      <p>Your account has been created. Please click the button below to activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Activate Account</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p>${activationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>Medical Survey Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Activate Your Medical Survey Account",
    html,
  });
};

export const sendSurveyNotification = async (email: string, name: string, surveyTitle: string, surveyLink: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">New Survey Available</h2>
      <p>Hello Dr. ${name},</p>
      <p>A new survey is available for you to complete: <strong>${surveyTitle}</strong></p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${surveyLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Take Survey</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p>${surveyLink}</p>
      <p>Best regards,<br>Medical Survey Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `New Survey Available: ${surveyTitle}`,
    html,
  });
};

export const sendPointsEarnedNotification = async (email: string, name: string, points: number, surveyTitle: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Points Earned</h2>
      <p>Hello Dr. ${name},</p>
      <p>Congratulations! You have earned <strong>${points} points</strong> for completing the survey: <strong>${surveyTitle}</strong></p>
      <p>Your points have been added to your account and can be redeemed for rewards.</p>
      <p>Best regards,<br>Medical Survey Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `You've Earned ${points} Points!`,
    html,
  });
};

export const sendRedemptionConfirmation = async (email: string, name: string, points: number, redemptionType: string, status: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4f46e5;">Redemption ${status === 'completed' ? 'Completed' : 'Requested'}</h2>
      <p>Hello Dr. ${name},</p>
      <p>Your redemption request for <strong>${points} points</strong> via <strong>${redemptionType}</strong> has been ${status === 'completed' ? 'completed' : 'received and is being processed'}.</p>
      <p>${status === 'completed' ? 'The reward has been sent to your account.' : 'We will process your request as soon as possible.'}</p>
      <p>Best regards,<br>Medical Survey Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Redemption ${status === 'completed' ? 'Completed' : 'Requested'}: ${points} Points`,
    html,
  });
};
