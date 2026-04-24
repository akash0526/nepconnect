import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("session_token")?.value;
	const { pathname } = request.nextUrl;

	const isPublicRoute =
		pathname === "/login" ||
		pathname === "/signup" ||
		pathname === "/" ||
		pathname.startsWith("/product/") ||
		pathname === "/api/verify-email";

	// Protected routes that always require auth
	const isProtectedRoute =
		pathname === "/dashboard" ||
		pathname === "/add-listing" ||
		pathname.startsWith("/account");

	if (!token && isProtectedRoute) {
		const url = new URL("/login", request.url);
		url.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(url);
	}

	if (token) {
		try {
			const secret = new TextEncoder().encode(process.env.JWT_SECRET);
			await jwtVerify(token, secret);
			// Redirect logged-in users away from login/signup
			if (pathname === "/login" || pathname === "/signup") {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
			return NextResponse.next();
		} catch (error) {
			const response = NextResponse.redirect(new URL("/login", request.url));
			response.cookies.delete("session_token");
			return response;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
