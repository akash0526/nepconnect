"use client";
import Link from "next/link";
import { useLanguage } from "../lib/LanguageContext";
import { Globe } from "lucide-react";

export default function Navbar({ user }) {
	const { lang, toggleLanguage } = useLanguage();

	return (
		<nav className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between max-w-xl mx-auto">
			<Link
				href="/"
				className="font-black text-green-700 text-xl tracking-tighter"
			>
				NepConnect
			</Link>
			<div className="flex items-center gap-2 text-sm font-medium text-gray-500">
				<Link
					href="/add-listing"
					className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition"
				>
					{lang === "ne" ? "बेच्नुहोस् +" : "Sell +"}
				</Link>
				<Link
					href="/farmer"
					className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-200 transition"
				>
					🌾 {lang === "ne" ? "किसान" : "Farmer"}
				</Link>
				<button
					onClick={toggleLanguage}
					className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs hover:bg-gray-200 transition"
				>
					<Globe size={14} />
					{lang === "ne" ? "EN" : "ने"}
				</button>
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
						{lang === "ne" ? "लगइन" : "Login"}
					</Link>
				)}
			</div>
		</nav>
	);
}
