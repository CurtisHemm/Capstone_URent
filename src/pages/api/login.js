// Imports
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';
import { serialize } from 'cookie';

// API for logining 
export default async function handler(req, res) { 
    console.log("Login API Route reached")

    // Check request method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Body parameters
    const { email, password } = req.body;
        
    try {
        // Get user data based on email address
        const { data: users, error } = await supabase
            .from('users_table') 
            .select('user_id, email_address, first_name, password')
            .eq('email_address', email)
            .limit(1);

        if (error || !users.length) {
            return res.status(400).json({ error: 'Invalid Email Address or Password'});
        }

        // Make sure its only 1 result
        const user = users[0];

        // Compare password with hashed password
        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            return res.status(400).json({ error: 'Invalid Email Address or Password '});
        }

        // Sanitized user for setting up session
        const sanitizedUser = { user_id: user.user_id, email_address: user.email_address, first_name: user.first_name};

        // Set up session
        const serialized = serialize('user', JSON.stringify(sanitizedUser), {
            httpOnly: true,                                     // Can't be accessed via JavaScript
            secure: process.env.NODE_ENV === 'production', // Secure cookie
            maxAge: 60 * 60 * 24 * 7,                       // 1 week long session
            path: '/',
        });

        // Push session
        res.setHeader('Set-Cookie', serialized);

        res.status(200).json({ message: 'Login Successful', user: { id: user.user_id, email: user.email_address, first_name: user.first_name } });

    } catch (loginError) {
        console.error('Login Error:', loginError);
        res.status(500).json({ error: 'Something went wrong' });
    }

}