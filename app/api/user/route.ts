import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from 'zod';

const userSchema = z.object({
    name: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must have at least 8 characters'),
    token: z.string().min(1, 'Invitation token is required')
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, password, token } = userSchema.parse(body);

        // 1. Validasi invitation token
        const invitation = await prisma.invitation.findUnique({
            where: { token }
        });

        if (!invitation) {
            return NextResponse.json(
                { message: "Invalid invitation token" },
                { status: 404 }
            );
        }

        if (invitation.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { message: "Email does not match invitation" },
                { status: 400 }
            );
        }

        if (new Date(invitation.expiresAt) < new Date()) {
            return NextResponse.json(
                { message: "Invitation has expired" },
                { status: 400 }
            );
        }

        // 2. Cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        // 3. Buat user baru dengan role dari invitation
        const hashedPassword = await hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: invitation.role // Gunakan role dari invitation
            }
        });

        // 4. Hapus invitation yang sudah digunakan
        await prisma.invitation.delete({
            where: { id: invitation.id }
        });

        // 5. Return response tanpa password
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            {
                user: userWithoutPassword,
                message: "User created successfully"
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

// const userSchema = z
//     .object({
//         name: z.string().min(1, 'Username is required').max(100),
//         email: z.string().min(1, 'Email is required').email('Invalid email'),
//         password: z
//             .string()
//             .min(1, 'Password is required')
//             .min(8, 'Password must have than 8 characters'),
//     })


// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const { email, name, password } = userSchema.parse(body);

//         const existingEmail = await prisma.user.findUnique({
//             where: { email: email }
//         });
//         if (existingEmail) {
//             return NextResponse.json({ user: null, message: "Email already exists" }, { status: 409 })
//         }

//         const hashedPassword = await hash(password, 10);
//         const newUser = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword
//             }
//         });

//         const { password: newUserPassword, ...rest } = newUser;

//         return NextResponse.json({ user: rest, message: "User created successfully" }, { status: 201 });
//     } catch (error) {
//         return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
//     }
// }