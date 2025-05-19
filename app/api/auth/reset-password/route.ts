// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import { verifyPasswordResetToken } from '@/lib/tokens'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    const { token, password } = await request.json()

    try {
        if (!token || !password) {
            return NextResponse.json(
                { error: "Token dan password diperlukan" },
                { status: 400 }
            )
        }

        const verifiedToken = await verifyPasswordResetToken(token)

        if ('error' in verifiedToken) {
            return NextResponse.json(
                { error: verifiedToken.error },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: verifiedToken.token.email },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "Pengguna tidak ditemukan" },
                { status: 404 }
            )
        }

        const hashedPassword = await hash(password, 10);

        // Update password user
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword }
        })

        // Hapus token yang sudah digunakan
        await prisma.passwordReset.delete({
            where: { id: verifiedToken.token.id }
        })

        return NextResponse.json(
            { success: true, message: "Password berhasil diubah" },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error in reset password:', error)
        return NextResponse.json(
            { error: "Terjadi kesalahan. Silakan coba lagi." },
            { status: 500 }
        )
    }
}