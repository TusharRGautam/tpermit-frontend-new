import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using backend credentials
const supabaseUrl = 'https://gbcncisbxiuzkrazbyew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiY25jaXNieGl1emtyYXpieWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTIzMTQsImV4cCI6MjA2OTQ2ODMxNH0.rh7rfaHgJHnjVY5p_T4273fsULQHfPSQtemBZcQ0w4Y';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Add type safety
export type SupabaseClient = typeof supabase;
