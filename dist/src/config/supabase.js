"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is required");
}
if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is required");
}
// Debug بسيط تشوف بيه إن القيم مظبوطة (متطبعش السر كله)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase key prefix:", supabaseKey.slice(0, 10) // لازم تكون "eyJhbGciOi"
);
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.default = supabase;
