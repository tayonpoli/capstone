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
            from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Invitation to Join Our Platform',
            html: `
        <p>You have been invited to join our platform. Please click the link below to complete your registration:</p>
        <a href="${invitationLink}">Complete Registration</a>
        <p>This link will expire in 48 hours.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw new Error('Failed to send invitation email');
    }
}