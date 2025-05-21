import { NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/tokens'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { ResetPasswordEmail } from '@/components/emails/reset-password';

export async function POST(req: Request) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
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
            from: 'MauManage <onboarding@resend.dev>',
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
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { message: "Token is required" },
                { status: 400 }
            );
        }

        const reset = await prisma.passwordReset.findUnique({
            where: { token }
        });

        if (!reset) {
            return NextResponse.json(
                { message: "Invalid invitation token" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );

    } catch (error) {
        console.error("Reset password validation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}