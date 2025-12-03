
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://boxcfgkktcyjwqxytzjd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveGNmZ2trdGN5andxeHl0empkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzA5MDcsImV4cCI6MjA4MDM0NjkwN30.hiHczAJDe0YkyZCt4vqEkAtS-3ysqfA_rfh4to3glaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
