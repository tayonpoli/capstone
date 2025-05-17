import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type UserRole = 'Owner' | 'Admin' | 'Staff'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })

    if (request.nextUrl.pathname.startsWith('/production') || request.nextUrl.pathname.startsWith('/api/production')) {
        if (!token) {
            const url = new URL('/sign-in', request.url)
            url.searchParams.set('callbackUrl', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        const userRole = token.role as UserRole

        if (request.nextUrl.pathname.startsWith('/production')) {

            if (userRole === 'Staff') {
                const isAllowed = request.nextUrl.pathname === '/production' ||
                    request.nextUrl.pathname.match(/^\/production\/[^\/]+$/) !== null

                if (!isAllowed) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url))
                }
            }
        }

        if (request.nextUrl.pathname.startsWith('/api/production')) {
            // Staff hanya bisa mengakses GET requests
            if (userRole === 'Staff') {
                return NextResponse.json(
                    { error: 'Unauthorized: Staff can only view data' },
                    { status: 403 }
                )
            }
        }

        return NextResponse.next()
    }

    if (request.nextUrl.pathname.startsWith('/sales') || request.nextUrl.pathname.startsWith('/api/sales')) {
        if (!token) {
            const url = new URL('/sign-in', request.url)
            url.searchParams.set('callbackUrl', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        const userRole = token.role as UserRole

        if (request.nextUrl.pathname.startsWith('/sales')) {

            if (userRole === 'Staff') {
                const isAllowed = request.nextUrl.pathname === '/sales' ||
                    request.nextUrl.pathname.match(/^\/sales\/[^\/]+$/) !== null

                if (!isAllowed) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url))
                }
            }
        }

        if (request.nextUrl.pathname.startsWith('/api/sales')) {
            // Staff hanya bisa mengakses GET requests
            if (userRole === 'Staff' && request.method !== 'POST') {
                return NextResponse.json(
                    { error: 'You need higher privileges' },
                    { status: 403 }
                )
            }
        }

        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/production/:path*',
        '/api/production/:path*',
        '/sales/:path*',
        '/api/sales/:path*',
    ],
}