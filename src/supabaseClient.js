// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qefbglcobobxiqzhtsxd.supabase.co'; // e.g., 'https://qefbglcobobxiqzhtsxd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmJnbGNvYm9ieGlxemh0c3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgzNTksImV4cCI6MjA2MzgxNDM1OX0.GJygwb8W9Tfk0hyK2Gw3h-OZ7Zkzc5BCeZqo7uwnUe4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);