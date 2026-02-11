
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'd27e168c2c3746f7a22c075ce1a49dc2';
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const REDIRECT_URI = 'http://127.0.0.1:9002/api/auth/spotify/callback';
export const SCOPES = 'user-library-read';

export const getAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        show_dialog: 'true',
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
};
