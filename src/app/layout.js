import "./globals.css";
import { Inter, Nunito } from "next/font/google";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { LanguageProvider } from "../lib/LanguageContext";
import Navbar from "../components/Navbar";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const nunito = Nunito({
	subsets: ["latin"],
	variable: "--font-nunito",
	display: "swap",
	weight: ["400", "600", "700", "800", "900"],
});

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
		<html lang="ne" className={`${inter.variable} ${nunito.variable}`}>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
				<meta name="theme-color" content="#059669" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="application-name" content="NepConnect" />
				<meta name="apple-mobile-web-app-title" content="NepConnect" />
				{/* PWA install script */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							if ('serviceWorker' in navigator) {
								window.addEventListener('load', () => {
									navigator.serviceWorker.register('/sw.js').catch(() => {});
								});
							}
						`,
					}}
				/>
			</head>
			<body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
				<LanguageProvider>
					<Navbar user={user} />
					<main className="max-w-2xl mx-auto px-4 pb-safe pt-2">
						{children}
					</main>
				</LanguageProvider>
			</body>
		</html>
	);
}
