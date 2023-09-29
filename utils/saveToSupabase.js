import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
export default async function saveToSupabase(table, dataToSave) {
  const getSupabase = () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      //   "https://zibmgusmsqnpqacuygec.supabase.co",
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYm1ndXNtc3FucHFhY3V5Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA4NDkzOTUsImV4cCI6MjAwNjQyNTM5NX0.DPSFsM5RekVICcIeV9PK08uwOEntnWuCVBWt-DBmxkA"
    );

    return supabase;
  };

  const supabase = getSupabase();

  try {
    const response = await supabase.from(table).insert(dataToSave).select();

    if (response.error) {
      throw response.error;
    }

    // Successfully inserted data, response.data will contain the inserted data
    return response.data;
  } catch (error) {
    console.error("Error inserting data:", error.message);

    // Here you can handle different types of errors (e.g., network issues, validation errors) differently
    // if (error.code === 'some_specific_error_code') {
    //   // Handle specific error type
    // }

    // Additionally, you may want to log the error to an error tracking service
  }
}
