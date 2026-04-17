import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<nav className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex justify-between items-center max-w-xl mx-auto">
					<span className="font-black text-green-700 text-xl tracking-tighter">
						NepConnect
					</span>
					<div className="flex gap-4 text-sm font-medium text-gray-500">
						<a href="/" className="hover:text-green-600">
							Home
						</a>
						<a
							href="/add-listing"
							className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
						>
							Sell +
						</a>
					</div>
				</nav>
				{children}
			</body>
		</html>
	);
}
