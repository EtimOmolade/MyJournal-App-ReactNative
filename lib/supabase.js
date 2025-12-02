// src/lib/supabase.js  (or root/lib/supabase.js)
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = 'https://cddbajkbrjpgefxdqrpq.supabase.co'
const supabaseAnonKey = 'sb_publishable_l90J1cU0cj6V4BFLMc-b3A_hBJisec-'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)