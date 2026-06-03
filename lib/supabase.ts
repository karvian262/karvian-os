import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ihgcldwrykygqakajegb.supabase.co";
const supabaseAnonKey = "sb_publishable_AJ9k_dAJlKt4O-bPPDkE9g_uWmUwsUs";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);