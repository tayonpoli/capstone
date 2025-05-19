import { NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/tokens'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { ResetPasswordEmail } from '@/components/emails/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, res: Response) {
    const { email } = await req.json()

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        return NextResponse.json(
            { error: "Email tidak ditemukan" },
            { status: 404 }
        )
    }

    const passwordResetToken = await generatePasswordResetToken(email)

    const resetLink = `${process.env.NEXTAUTH_URL}/new-password?token=${passwordResetToken.token}`;

    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: [email],
        subject: 'Reset Password Verification',
        react: ResetPasswordEmail({ userFirstName: existingUser.name || "", resetPasswordLink: resetLink }),
    });

    if (error) {
        return NextResponse.json(error)
    }

    return NextResponse.json(
        { success: true, message: "Email sent successfully" },
        { status: 200 }
    )
}