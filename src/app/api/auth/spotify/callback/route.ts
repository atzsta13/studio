
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'd27e168c2c3746f7a22c075ce1a49dc2';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:9002/api/auth/spotify/callback';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    if (!CLIENT_SECRET) {
        return NextResponse.json(
            { error: 'Missing SPOTIFY_CLIENT_SECRET environment variable' },
            { status: 500 }
        );
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            },
            body: params,
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('Spotify Token Error:', errorData);
            return NextResponse.json({ error: 'Failed to exchange token', details: errorData }, { status: tokenResponse.status });
        }

        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokenData;

        const cookieStore = await cookies();

        // Set cookies
        cookieStore.set('spotify_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: expires_in,
        });

        if (refresh_token) {
            cookieStore.set('spotify_refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 30 * 24 * 60 * 60, // 30 days
            });
        }

        // Redirect to discover page
        return NextResponse.redirect(new URL('/discover', request.url));

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
