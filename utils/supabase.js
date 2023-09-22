// utils/supabase.js

import { createClient } from "@supabase/supabase-js";
const NEXT_PUBLIC_SUPABASE_URL = "https://zibmgusmsqnpqacuygec.supabase.co";
const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYm1ndXNtc3FucHFhY3V5Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NDkzOTUsImV4cCI6MjAwNjQyNTM5NX0.DPSFsM5RekVICcIeV9PK08uwOEntnWuCVBWt-DBmxkA";
const getSupabase = () => {
  const supabase = createClient();
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return supabase;
};

export { getSupabase };
