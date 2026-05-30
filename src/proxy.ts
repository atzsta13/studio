import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Rate limits per window (60 seconds)
const LIMITS: Record<string, number> = {
    '/api/ai/':  20,   // AI recommendations — expensive, Gemini API costs
    '/api/':    100,   // All other routes
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? 'unknown';

    // Pick the most specific limit that matches
    const limitKey = Object.keys(LIMITS).find(prefix => pathname.startsWith(prefix)) ?? '/api/';
    const maxRequests = LIMITS[limitKey];

    const allowed = rateLimit(`${ip}:${limitKey}`, { windowMs: 60_000, maxRequests });

    if (!allowed) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: { 'Retry-After': '60' },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
