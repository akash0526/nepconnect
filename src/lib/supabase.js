import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}
export const getDeviceId = () => {
	if (typeof window !== "undefined") {
		let id = localStorage.getItem("nepconnect_device_id");
		if (!id) {
			id = Math.random().toString(36).substring(2) + Date.now().toString(36);
			localStorage.setItem("nepconnect_device_id", id);
			console.log(id);
		}
		return id;
	}
	return null;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
