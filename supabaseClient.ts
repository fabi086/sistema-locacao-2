import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Replace these placeholders with your actual Supabase project URL and anon key.
// You can find these in your Supabase project settings under "API".
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// This flag will be used to conditionally render the app or a setup message.
export const isSupabaseConfigured = !supabaseUrl.includes('YOUR_SUPABASE_URL') && !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

// To prevent crashes, we'll export a potentially null client.
// The app's entry point will check `isSupabaseConfigured` before attempting to use the client.
export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
