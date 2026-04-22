import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
	// ✅ Await the cookies() promise
	const cookieStore = await cookies();
	const token = cookieStore.get("session_token")?.value;

	if (!token) {
		return NextResponse.json({ user: null }, { status: 401 });
	}

	try {
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);

		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !serviceRoleKey) {
			throw new Error("Missing Supabase environment variables");
		}

		const supabase = createClient(supabaseUrl, serviceRoleKey);
		const { data: user } = await supabase
			.from("users")
			.select("id, username, email")
			.eq("id", payload.userId)
			.single();

		return NextResponse.json({ user });
	} catch (error) {
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
