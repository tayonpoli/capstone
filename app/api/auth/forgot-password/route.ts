// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/tokens'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
    const { email } = await request.json()

    try {
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
        await sendPasswordResetEmail(
            email,
            passwordResetToken.token,
            existingUser.name
        )

        return NextResponse.json(
            { success: true, message: "Email reset password telah dikirim" },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error in forgot password:', error)
        return NextResponse.json(
            { error: "Terjadi kesalahan. Silakan coba lagi." },
            { status: 500 }
        )
    }
}