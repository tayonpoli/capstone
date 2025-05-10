import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // Parse request body
        const { email, role } = await req.json();

        // Validasi input
        if (!email || !role) {
            return NextResponse.json(
                { message: "Email and role are required" },
                { status: 400 }
            );
        }

        // Validasi role (case insensitive)
        const validRoles = ['Owner', 'Admin', 'Staff'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { message: "Invalid role. Allowed roles: Owner, Admin, Staff" },
                { status: 409 }
            );
        }

        // Cek apakah user sudah ada
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        // Buat token unik
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 2); // Expires in 2 days

        // Simpan invitation ke database
        const invitation = await prisma.invitation.create({
            data: {
                email: email,
                role: role,
                token,
                expiresAt
            }
        });

        // Kirim email invitation
        await sendInvitationEmail(email, token);

        return NextResponse.json(
            { message: "Invitation sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error('Invitation error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
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

        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation) {
            return NextResponse.json(
                { message: "Invalid invitation token" },
                { status: 404 }
            );
        }

        if (new Date(invitation.expiresAt) < new Date()) {
            return NextResponse.json(
                { message: "Invitation has expired" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                email: invitation.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Invitation validation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}