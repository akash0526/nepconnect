import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { LanguageProvider } from "../lib/LanguageContext";
import Navbar from "../components/Navbar";

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
		<html lang="ne">
			<body className={`${inter.className} bg-gray-50`}>
				<LanguageProvider>
					<Navbar user={user} />
					<main className="pt-2">{children}</main>
				</LanguageProvider>
			</body>
		</html>
	);
}
