import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("session_token")?.value;
		if (!token) {
			return NextResponse.json({ user: null }, { status: 401 });
		}
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return NextResponse.json({
			user: {
				userId: payload.userId,
				username: payload.username,
				deviceId: payload.deviceId ?? null,
			},
		});
	} catch {
		return NextResponse.json({ user: null }, { status: 401 });
	}
}
