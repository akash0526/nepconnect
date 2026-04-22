import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.redirect(
			new URL("/login?error=Invalid token", request.url),
		);
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error("Missing Supabase environment variables");
	}

	const supabase = createClient(supabaseUrl, serviceRoleKey);

	const { data: user, error } = await supabase
		.from("users")
		.select("id")
		.eq("email_verification_token", token)
		.maybeSingle();

	if (error || !user) {
		return NextResponse.redirect(
			new URL("/login?error=Invalid or expired token", request.url),
		);
	}

	const { error: updateError } = await supabase
		.from("users")
		.update({ email_verified: true, email_verification_token: null })
		.eq("id", user.id);

	if (updateError) {
		return NextResponse.redirect(
			new URL("/login?error=Verification failed", request.url),
		);
	}

	return NextResponse.redirect(
		new URL("/login?message=Email verified! You can now log in.", request.url),
	);
}
