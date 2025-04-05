// Import
import { createClient } from "@supabase/supabase-js";

// Get supabseUrl and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with url and key
const supabase = createClient(supabaseUrl, supabaseKey);

// Export client
export default supabase;