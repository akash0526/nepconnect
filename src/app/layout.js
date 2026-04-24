import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

async function getUser() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("session_token")?.value;
		if (!token) return null;
		const secret = new TextEncoder().encode(process.env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch {
		return null;
	}
}

export default async function RootLayout({ children }) {
	const user = await getUser();

	return (
		<html lang="en">
			<body className={inter.className}>
				<nav className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex justify-between items-center max-w-xl mx-auto">
					<Link
						href="/"
						className="font-black text-green-700 text-xl tracking-tighter"
					>
						NepConnect
					</Link>
					<div className="flex gap-3 items-center text-sm font-medium text-gray-500">
						<Link
							href="/add-listing"
							className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
						>
							Sell +
						</Link>
						{user ? (
							<Link
								href="/dashboard"
								className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition"
							>
								<span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
									{String(user.username ?? "")
										.charAt(0)
										.toUpperCase()}
								</span>
								{String(user.username ?? "")}
							</Link>
						) : (
							<Link
								href="/login"
								className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs hover:bg-blue-700 transition"
							>
								Login
							</Link>
						)}
					</div>
				</nav>
				{children}
			</body>
		</html>
	);
}
