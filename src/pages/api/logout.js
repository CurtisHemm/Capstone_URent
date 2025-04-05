// Import
import { serialize } from 'cookie';

// API for loging out of session
export default function handler(req, res) {
    const serialized = serialize('user', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });

    // Push logout
    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({ message: 'Logged out successfully' });
}