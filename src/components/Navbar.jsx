"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/LanguageContext";
import { supabase, getDeviceId } from "../lib/supabase";
import {
	Home,
	Store,
	Flower2,
	User,
	PlusCircle,
	Globe,
	LogIn,
	Menu,
	X,
	Heart,
	Bell,
	BarChart3,
	MessageCircle,
	Smartphone,
} from "lucide-react";

export default function Navbar({ user }) {
	const { lang, toggleLanguage } = useLanguage();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const deviceId = getDeviceId();
	// Use the JWT user ID if available (uuid from users table), else deviceId
	const userId = user?.userId || deviceId;

	const isAuthPage = pathname === "/login" || pathname === "/signup";

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	// Fetch unread notification count
	useEffect(() => {
		if (!userId && !deviceId) return;
		const fetchCount = async () => {
			let query = supabase
				.from("notifications")
				.select("id", { count: "exact", head: true })
				.is("is_read", false);
			
			if (user?.userId) {
				query = query.eq("user_id", user.userId);
			} else if (deviceId) {
				query = query.is("user_id", null).eq("device_id", deviceId);
			}
			
			const { count } = await query;
			setUnreadCount(count || 0);
		};
		fetchCount();

		// Subscribe to realtime notification changes
		const filterUser = user?.userId
			? `user_id=eq.${user.userId}`
			: `device_id=eq.${deviceId}`;
		
		const channel = supabase
			.channel("notifications-count")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: filterUser,
				},
				() => fetchCount(),
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	}, [user?.userId, deviceId]);

	const navLinks = [
		{ href: "/", label: lang === "ne" ? "गृह" : "Home", icon: Home, exact: true },
		{ href: "/farmer", label: lang === "ne" ? "किसान" : "Farmer", icon: Flower2 },
		{ href: "/saved", label: lang === "ne" ? "मनपर्यो" : "Saved", icon: Heart },
		{ href: "/notifications", label: lang === "ne" ? "सूचना" : "Alerts", icon: Bell, badge: unreadCount },
		{ href: user ? "/dashboard" : "/login", label: lang === "ne" ? "मेरो" : "Profile", icon: User },
	];

	const bottomLinks = [
		{ href: "/", label: lang === "ne" ? "गृह" : "Home", icon: Home, exact: true },
		{ href: "/saved", label: lang === "ne" ? "मनपर्यो" : "Saved", icon: Heart },
		{ href: user ? "/add-listing" : "/login", label: lang === "ne" ? "बिक्री" : "Sell", icon: PlusCircle, isSell: true },
		{ href: "/notifications", label: lang === "ne" ? "सूचना" : "Alerts", icon: Bell, badge: unreadCount },
		{ href: user ? "/dashboard" : "/login", label: lang === "ne" ? "मेरो" : "Profile", icon: User },
	];

	const isActive = (href, exact) => {
		if (exact) return pathname === href;
		return pathname.startsWith(href);
	};

	if (isAuthPage) return null;

	return (
		<>
			{/* ── Top Header ── */}
			<header
				className={`sticky top-0 z-40 transition-all duration-200 ${
					scrolled
						? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm"
						: "bg-[var(--color-primary)]"
				}`}
			>
				<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
					<Link
						href="/"
						className={`font-black text-xl tracking-tight ${
							scrolled
								? "text-[var(--color-primary)]"
								: "text-white"
						}`}
					>
						🌿 NepConnect
					</Link>

					<div className="flex items-center gap-1.5">
						{/* Quick links */}
						<Link
							href="/market-prices"
							className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition ${
								scrolled
									? "bg-amber-100 text-amber-700 hover:bg-amber-200"
									: "bg-white/20 text-white hover:bg-white/30"
							}`}
						>
							<BarChart3 size={12} /> {lang === "ne" ? "मूल्य" : "Prices"}
						</Link>

						{/* Language toggle */}
						<button
							onClick={toggleLanguage}
							className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition ${
								scrolled
									? "bg-gray-100 text-gray-600 hover:bg-gray-200"
									: "bg-white/20 text-white hover:bg-white/30"
							}`}
						>
							<Globe size={12} />
							{lang === "ne" ? "EN" : "ने"}
						</button>

						{/* Desktop sell button */}
						{user ? (
							<Link
								href="/add-listing"
								className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
									scrolled
										? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
										: "bg-white text-[var(--color-primary)] hover:bg-gray-100"
								}`}
							>
								<PlusCircle size={13} />
								{lang === "ne" ? "बेच्नुहोस्" : "Sell"}
							</Link>
						) : (
							<Link
								href="/login"
								className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
									scrolled
										? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
										: "bg-white text-[var(--color-primary)] hover:bg-gray-100"
								}`}
							>
								<LogIn size={13} />
								{lang === "ne" ? "लगइन" : "Login"}
							</Link>
						)}

						{/* Mobile menu toggle */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className={`sm:hidden p-1.5 rounded-lg transition relative ${
								scrolled
									? "text-gray-600 hover:bg-gray-100"
									: "text-white hover:bg-white/20"
							}`}
						>
							{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
							{/* Notification dot on hamburger */}
							{!mobileMenuOpen && unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu dropdown */}
				{mobileMenuOpen && (
					<div className="sm:hidden bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 animate-slide-down shadow-lg">
						<div className="max-w-2xl mx-auto px-4 py-3 space-y-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition relative ${
										isActive(link.href, link.exact)
											? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
											: "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
									}`}
								>
									<link.icon size={18} />
									{link.label}
									{link.badge > 0 && (
										<span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
											{link.badge}
										</span>
									)}
								</Link>
							))}

							{/* Extra links */}
							<Link
								href="/market-prices"
								className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
							>
								<BarChart3 size={18} />
								{lang === "ne" ? "बजार मूल्य" : "Market Prices"}
							</Link>

							{/* Mobile sell or login */}
							<div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
								{user ? (
									<Link
										href="/add-listing"
										className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white"
									>
										<PlusCircle size={18} />
										{lang === "ne" ? "नयाँ बिक्री" : "Sell Something"}
									</Link>
								) : (
									<Link
										href="/login"
										className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[var(--color-accent)] text-white"
									>
										<LogIn size={18} />
										{lang === "ne" ? "लगइन गर्नुहोस्" : "Login to Sell"}
									</Link>
								)}
							</div>
						</div>
					</div>
				)}
			</header>

			{/* ── Bottom Navigation Bar (Mobile) ── */}
			<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
				<div className="flex items-center justify-around h-16 px-1">
					{bottomLinks.map((link) => {
						const active = isActive(link.href, link.exact);
						if (link.isSell) {
							return (
								<Link
									key={link.href}
									href={link.href}
									className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 -mt-4"
								>
									<div className="bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white p-3.5 rounded-2xl shadow-lg shadow-green-200 dark:shadow-green-900/30 active:scale-95 transition-transform">
										<PlusCircle size={24} strokeWidth={2.5} />
									</div>
									<span className="text-[9px] font-semibold text-gray-400 leading-tight mt-0.5">
										{link.label}
									</span>
								</Link>
							);
						}
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px] relative ${
									active
										? "text-[var(--color-primary)]"
										: "text-gray-400 hover:text-gray-600"
								}`}
							>
								<div
									className={`p-1.5 rounded-lg transition-all ${
										active ? "bg-[var(--color-primary-light)] scale-110" : ""
									}`}
								>
									<link.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
									{link.badge > 0 && (
										<span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 ring-2 ring-white dark:ring-slate-900">
											{link.badge > 9 ? "9+" : link.badge}
										</span>
									)}
								</div>
								<span className="text-[9px] font-semibold leading-tight">
									{link.label}
								</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</>
	);
}