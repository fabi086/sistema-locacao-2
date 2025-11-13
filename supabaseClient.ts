import { createClient } from '@supabase/supabase-js';

// These variables should be set in your environment configuration.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and anon key are required. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
