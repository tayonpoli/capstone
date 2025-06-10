import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import InvitationEmail from '@/components/emails/invitation';

export async function POST(req: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, role } = await req.json();

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

    const linkInvitation = `${process.env.NEXTAUTH_URL}}/sign-up?token=${token}`;

    // Kirim email invitation
    const { data, error } = await resend.emails.send({
        from: 'MauManage <no-reply@maumanage.site>',
        to: [email],
        subject: 'MauManage Invitation Email',
        react: InvitationEmail({ email: email || "", invitationLink: linkInvitation }),
    });

    if (error) {
        return NextResponse.json(error)
    }

    return NextResponse.json(
        { success: true, message: "Email Invitation sent successfully" },
        { status: 200 }
    )
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