import nodemailer from 'nodemailer';

// Konfigurasi transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export async function sendInvitationEmail(email: string, token: string) {
    try {
        const invitationLink = `${process.env.NEXTAUTH_URL}/sign-up?token=${token}`;

        const mailOptions = {
            from: `"MauManage" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Invitation to Join Our Platform',
            html: `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="text-align: center;">
        <img src="https://yourapp.com/logo.png" alt="Your App Logo" style="width: 120px; margin-bottom: 20px;" />
      </div>

      <h2 style="color: #2c3e50;">Hello, there 👋</h2>
      <p style="font-size: 16px; color: #333;">
        You’ve been invited to join <strong>MauManage</strong>. To complete your registration and start exploring our features, please click the button below.
      </p>

      <table style="margin-top: 20px; width: 100%; font-size: 15px; color: #444;">
        <tr>
          <td style="padding: 8px 0;"><strong>Invitation ID:</strong></td>
          <td style="padding: 8px 0;">#INV-2025A001</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Valid for:</strong></td>
          <td style="padding: 8px 0;">48 hours</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Registered Email:</strong></td>
          <td style="padding: 8px 0;">${email}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">
          Complete Registration
        </a>
      </div>

      <p style="font-size: 14px; color: #777; text-align: center;">
        If you did not expect this email, you can ignore it or contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.
      </p>
    </div>

    <div style="max-width: 600px; margin: 30px auto 0; text-align: center; font-size: 12px; color: #aaa;">
      <p>© ${new Date().getFullYear()} MauManage. All rights reserved.</p>
      <p>Email ini dikirim secara otomatis. Jangan balas ke email ini.</p>
    </div>
  </div>
  `,
            //         html: `
            //     <p>You have been invited to join our platform. Please click the link below to complete your registration:</p>
            //     <a href="${invitationLink}">Complete Registration</a>
            //     <p>This link will expire in 48 hours.</p>
            //   `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw new Error('Failed to send invitation email');
    }
}