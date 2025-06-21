import { NextResponse } from 'next/server'
import { hash, compare } from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: {
        params: Promise<{ id: string }>
    }
) {
    const { id } = await params
    const { oldPassword, password } = await request.json()

    try {
        if (!oldPassword || !password) {
            return NextResponse.json(
                { error: "Old password and new password are required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: id },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const isPasswordValid = await compare(oldPassword, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Old password is incorrect" },
                { status: 401 }
            )
        }

        const hashedPassword = await hash(password, 10)

        await prisma.user.update({
            where: { id: id },
            data: { password: hashedPassword }
        })

        return NextResponse.json(
            { success: true, message: "Password changed successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error in password change:', error)
        return NextResponse.json(
            { error: "An error occurred. Please try again." },
            { status: 500 }
        )
    }
}