import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  // replace with your URL and API key
  'https://vzociuaifoouyldntyxo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6b2NpdWFpZm9vdXlsZG50eXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc1NTMwMjYsImV4cCI6MTk4MzEyOTAyNn0.InqfZcT5ggHUoS6Aib2aMpMcMZR3ppf9v3HB3Sew7rQ',
);
