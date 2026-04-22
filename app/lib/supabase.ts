import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ctaqoinghnuyzksrugzh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0YXFvaW5naG51eXprc3J1Z3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTYyOTYsImV4cCI6MjA5MjM3MjI5Nn0.gcaF1TQCWkyY7UjfdMFUfCvu47A4EUQYlWGQUXPz7eo";

export const supabase = createClient(supabaseUrl, supabaseKey);