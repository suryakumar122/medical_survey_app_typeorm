import { sendEmail, sendActivationEmail, sendPointsEarnedNotification, sendRedemptionConfirmation, sendSurveyNotification } from "@lib/email";

export class EmailService {
  static async sendUserActivationEmail(email: string, name: string, activationToken: string): Promise<boolean> {
    const activationLink = `${process.env.NEXTAUTH_URL}/activate-account?token=${activationToken}`;
    return await sendActivationEmail(email, name, activationLink);
  }

  static async sendNewSurveyNotification(email: string, name: string, surveyTitle: string, surveyId: string): Promise<boolean> {
    const surveyLink = `${process.env.NEXTAUTH_URL}/doctor/surveys/${surveyId}`;
    return await sendSurveyNotification(email, name, surveyTitle, surveyLink);
  }

  static async sendPointsEarnedEmail(email: string, name: string, points: number, surveyTitle: string): Promise<boolean> {
    return await sendPointsEarnedNotification(email, name, points, surveyTitle);
  }

  static async sendRedemptionEmail(email: string, name: string, points: number, redemptionType: string, status: string): Promise<boolean> {
    return await sendRedemptionConfirmation(email, name, points, redemptionType, status);
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4f46e5;">Password Reset</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Please click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support.</p>
        <p>Best regards,<br>Medical Survey Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: "Reset Your Medical Survey Password",
      html,
    });
  }

  static async sendCustomEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    from?: string
  ): Promise<boolean> {
    return sendEmail({
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      html: htmlContent,
      from,
    });
  }
}
