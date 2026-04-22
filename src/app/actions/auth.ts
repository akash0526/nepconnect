"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { SignJWT } from "jose";
import { sendVerificationEmail } from "../../lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
	throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ---------- SIGNUP ----------
const SignupSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters"),
	email: z.string().email("Invalid email address"),
	phone_number: z.string().optional(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signup(formData: FormData) {
	const validatedFields = SignupSchema.safeParse({
		username: formData.get("username"),
		email: formData.get("email"),
		phone_number: formData.get("phone_number") || undefined,
		password: formData.get("password"),
	});

	if (!validatedFields.success) {
		return { error: validatedFields.error.flatten().fieldErrors };
	}

	const { username, email, phone_number, password } = validatedFields.data;

	// Check if user exists
	const { data: existing } = await supabase
		.from("users")
		.select("username, email")
		.or(`username.eq.${username},email.eq.${email}`)
		.maybeSingle();

	if (existing) {
		return { error: "Username or email already exists" };
	}

	// Hash password
	const password_hash = await bcrypt.hash(password, 12);
	const email_verification_token = randomBytes(32).toString("hex");

	// Insert user
	const { error: insertError } = await supabase.from("users").insert({
		username,
		email,
		phone_number: phone_number || null,
		password_hash,
		email_verification_token,
	});

	if (insertError) {
		console.error(insertError);
		return { error: "Failed to create user" };
	}

	// ✅ FIX: Get the base URL from environment (with a fallback)
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

	// ✅ Pass the base URL to the email function
	await sendVerificationEmail(email, email_verification_token, baseUrl);

	return { success: true, message: "User created! Please verify your email." };
}

// ---------- LOGIN ----------
const LoginSchema = z.object({
	username: z.string().min(1, "Username required"),
	password: z.string().min(1, "Password required"),
});

export async function login(formData: FormData) {
	const validatedFields = LoginSchema.safeParse({
		username: formData.get("username"),
		password: formData.get("password"),
	});

	if (!validatedFields.success) {
		return { error: validatedFields.error.flatten().fieldErrors };
	}

	const { username, password } = validatedFields.data;

	// Find user by username
	const { data: user, error } = await supabase
		.from("users")
		.select("id, username, email, password_hash, email_verified")
		.eq("username", username)
		.maybeSingle();

	if (error || !user) {
		return { error: "Invalid username or password" };
	}

	// Verify password
	const isValid = await bcrypt.compare(password, user.password_hash);
	if (!isValid) {
		return { error: "Invalid username or password" };
	}

	if (!user.email_verified) {
		return { error: "Please verify your email before logging in" };
	}

	// Create JWT
	const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
	const token = await new SignJWT({ userId: user.id, username: user.username })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("7d")
		.sign(secret);

	// Set cookie - dynamically import cookies()
	const { cookies } = await import("next/headers");
	(await cookies()).set("session_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});

	return { success: true, redirectTo: "/dashboard" };
}

// ---------- LOGOUT ----------
export async function logout() {
	const { cookies } = await import("next/headers");
	(await cookies()).delete("session_token");
	return { success: true };
}
