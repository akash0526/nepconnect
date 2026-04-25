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

	const { data: existing } = await supabase
		.from("users")
		.select("username, email")
		.or(`username.eq.${username},email.eq.${email}`)
		.maybeSingle();

	if (existing) {
		return { error: "Username or email already exists" };
	}

	const password_hash = await bcrypt.hash(password, 12);
	const email_verification_token = randomBytes(32).toString("hex");

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

	await sendVerificationEmail(email, email_verification_token);
	return { success: true, message: "User created! Please verify your email." };
}

// ---------- LOGIN ----------
const LoginSchema = z.object({
	username: z.string().min(1, "Username required"),
	password: z.string().min(1, "Password required"),
	device_id: z.string().optional(),
});

export async function login(formData: FormData) {
	const validatedFields = LoginSchema.safeParse({
		username: formData.get("username"),
		password: formData.get("password"),
		device_id: formData.get("device_id") || undefined,
	});

	if (!validatedFields.success) {
		return { error: validatedFields.error.flatten().fieldErrors };
	}

	const { username, password, device_id } = validatedFields.data;

	const { data: user, error } = await supabase
		.from("users")
		.select("id, username, email, password_hash, email_verified, device_id")
		.eq("username", username)
		.maybeSingle();

	if (error || !user) {
		return { error: "Invalid username or password" };
	}

	const isValid = await bcrypt.compare(password, user.password_hash);
	if (!isValid) {
		return { error: "Invalid username or password" };
	}

	if (!user.email_verified) {
		return { error: "Please verify your email before logging in" };
	}

	// Save the device_id to the user record so listings (stored with user_id = device_id)
	// can be associated with this account. Only update if a device_id was sent and it's
	// different from what's already stored — avoids unnecessary writes.
	const resolvedDeviceId = device_id || user.device_id || null;
	if (device_id && device_id !== user.device_id) {
		await supabase
			.from("users")
			.update({ device_id, updated_at: new Date().toISOString() })
			.eq("id", user.id);
	}

	// Include device_id in JWT so /api/me can return it to client components
	const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
	const token = await new SignJWT({
		userId: user.id,
		username: user.username,
		deviceId: resolvedDeviceId,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("7d")
		.sign(secret);

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
