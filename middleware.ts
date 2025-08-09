import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

type UserRole = 'Owner' | 'Admin' | 'Staff';

// Initialize i18n middleware
const handleI18nRouting = createMiddleware(routing);

// Define public pages that don't require authentication
const publicPages = [
    '/',
    '/sign-in',
    '/forgot-password',
    '/sign-up',
    '/unauthorized',
    '/api/auth'
];

const authMiddleware = withAuth(
    // This callback is only invoked if authorized returns true
    function onSuccess(req) {
        // Handle i18n routing first
        const response = handleI18nRouting(req);

        // Then perform role-based authorization checks
        const pathname = req.nextUrl.pathname;
        const token = req.nextauth?.token;
        const userRole = token?.role as UserRole;

        // Production routes
        if (pathname.startsWith('/production') || pathname.startsWith('/api/production')) {
            if (userRole === 'Staff') {
                if (pathname.startsWith('/production')) {
                    const isAllowed = pathname === '/production' ||
                        pathname.match(/^\/production\/[^\/]+$/) !== null;

                    if (!isAllowed) {
                        return NextResponse.redirect(new URL('/unauthorized', req.url));
                    }
                } else if (pathname.startsWith('/api/production')) {
                    return NextResponse.json(
                        { error: 'Unauthorized: Staff can only view data' },
                        { status: 403 }
                    );
                }
            }
        }

        // Sales routes
        if (pathname.startsWith('/sales') || pathname.startsWith('/api/sales')) {
            if (userRole === 'Staff') {
                if (pathname.startsWith('/sales')) {
                    const isAllowed = pathname === '/sales' ||
                        pathname.match(/^\/sales\/[^\/]+$/) !== null;

                    if (!isAllowed) {
                        return NextResponse.redirect(new URL('/unauthorized', req.url));
                    }
                } else if (pathname.startsWith('/api/sales') && req.method !== 'POST') {
                    return NextResponse.json(
                        { error: 'You need higher privileges' },
                        { status: 403 }
                    );
                }
            }
        }

        // Purchase routes
        if (pathname.startsWith('/purchase') || pathname.startsWith('/api/purchase')) {
            if (userRole === 'Staff') {
                if (pathname.startsWith('/purchase')) {
                    const isAllowed = pathname === '/purchase' ||
                        pathname.match(/^\/purchase\/[^\/]+$/) !== null;

                    if (!isAllowed) {
                        return NextResponse.redirect(new URL('/unauthorized', req.url));
                    }
                } else if (pathname.startsWith('/api/purchase')) {
                    return NextResponse.json(
                        { error: 'Unauthorized: Staff can only view data' },
                        { status: 403 }
                    );
                }
            }
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({ token }) => token != null
        },
        pages: {
            signIn: '/sign-in'
        }
    }
);

export default function middleware(req: NextRequest) {
    // Create regex to match public pages with all supported locales
    const publicPathnameRegex = RegExp(
        `^(/(${routing.locales.join('|')}))?(${publicPages
            .flatMap((p) => (p === '/' ? ['', '/'] : p))
            .join('|')})/?$`,
        'i'
    );

    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

    if (isPublicPage) {
        return handleI18nRouting(req);
    } else {
        return (authMiddleware as any)(req);
    }
}

export const config = {
    matcher: [
        '/((?!api|_next|.*\\..*).*)'
    ]
};