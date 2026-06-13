"use client";

import { useEffect, useState } from "react";
import { logout } from "../actions/auth";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import {
	LogOut,
	Plus,
	Package,
	Trash2,
	ShieldCheck,
	MapPin,
	Phone,
	MessageCircle,
	Sparkles,
	Tag,
	Clock,
	User as UserIcon,
	BarChart3,
	AlertCircle,
	Settings,
	ChevronRight,
} from "lucide-react";

type Listing = {
	id: string;
	title: string;
	price: number;
	category: string;
	description?: string;
	phone?: string;
	image_url?: string;
	image_urls?: string[];
	manual_address?: string;
	ai_condition_report?: string;
	ai_detected_item?: string;
	is_verified?: boolean;
	created_at: string;
	user_id: string;
};

type User = { userId: string; username: string };

export default function Dashboard() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [listings, setListings] = useState<Listing[]>([]);
	const [loadingUser, setLoadingUser] = useState(true);
	const [loadingListings, setLoadingListings] = useState(true);
	const [deleting, setDeleting] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/me")
			.then((r) => r.json())
			.then((data) => {
				if (!data.user) {
					router.push("/login");
					return;
				}
				setUser(data.user);
				setLoadingUser(false);
				if (data.user.deviceId) {
					loadListings(data.user.deviceId);
				} else {
					setLoadingListings(false);
				}
			})
			.catch(() => router.push("/login"));
	}, []);

	async function loadListings(deviceId: string) {
		setLoadingListings(true);
		const { data, error } = await supabase
			.from("listings")
			.select("*")
			.eq("user_id", deviceId)
			.order("created_at", { ascending: false });
		if (!error) setListings(data || []);
		setLoadingListings(false);
	}

	async function handleDelete(id: string) {
		if (!confirm("Mark as sold and remove this listing?")) return;
		setDeleting(id);
		const deviceId = (user as any)?.deviceId;
		const { error } = await supabase
			.from("listings")
			.delete()
			.eq("id", id)
			.eq("user_id", deviceId);
		if (!error) setListings((prev) => prev.filter((l) => l.id !== id));
		setDeleting(null);
	}

	async function handleLogout() {
		await logout();
		router.push("/login");
	}

	const thumb = (item: Listing) =>
		item.image_urls?.length ? item.image_urls[0] : item.image_url || null;

	const timeAgo = (d: string) => {
		const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days}d ago`;
		if (days < 30) return `${Math.floor(days / 7)}w ago`;
		return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const initials = user?.username?.slice(0, 2).toUpperCase() ?? "..";
	const verified = listings.filter((l) => l.is_verified).length;
	const totalValue = listings.reduce((s, l) => s + (l.price || 0), 0);

	return (
		<div className="pb-24">
			{/* Header / Profile */}
			<div className="bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-xl font-black">
								{initials}
							</div>
							<div>
								<p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Dashboard</p>
								<h1 className="text-xl font-black tracking-tight">
									{loadingUser ? "..." : user?.username}
								</h1>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
						>
							<LogOut size={14} /> Sign out
						</button>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 gap-3 mb-5">
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
					<div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
						<Package size={14} className="text-[var(--color-primary)]" />
						Active Listings
					</div>
					<p className="text-3xl font-black text-gray-900 dark:text-gray-100">
						{loadingListings ? "..." : listings.length}
					</p>
					<p className="text-xs text-gray-400 mt-1">
						{verified > 0 ? `${verified} AI-verified` : "No verified yet"}
					</p>
				</div>
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
					<div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
						<Tag size={14} className="text-emerald-600" />
						Total Value
					</div>
					<p className="text-3xl font-black text-[var(--color-primary)]">
						{loadingListings ? "..." : `NPR ${totalValue.toLocaleString()}`}
					</p>
					<p className="text-xs text-gray-400 mt-1">
						Across all listings
					</p>
				</div>
			</div>

			{/* Verified Banner */}
			{!loadingListings && verified > 0 && (
				<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3 mb-5 animate-fade-in">
					<div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center flex-shrink-0">
						<ShieldCheck size={20} className="text-green-700 dark:text-green-300" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-bold text-green-800 dark:text-green-200">
							{verified} listing{verified > 1 ? "s" : ""} AI-verified
						</p>
						<p className="text-xs text-green-600 dark:text-green-400">
							Verified listings get significantly more buyer inquiries
						</p>
					</div>
					<ShieldCheck size={18} className="text-green-500 flex-shrink-0" />
				</div>
			)}

			{/* Quick Actions */}
			<div className="flex gap-3 mb-6">
				<Link
					href="/add-listing"
					className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-green-200 dark:shadow-green-900/30 hover:shadow-xl active:scale-[0.98] transition-all"
				>
					<Plus size={18} />
					New Listing
				</Link>
				<Link
					href="/farmer"
					className="flex-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-[0.98] transition-all"
				>
					🌾
					Farmer Hub
				</Link>
			</div>

			{/* Section Title */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
					<Package size={18} className="text-[var(--color-primary)]" />
					My Listings
				</h2>
				{!loadingListings && listings.length > 0 && (
					<span className="text-xs font-bold text-gray-500">
						{listings.length} total
					</span>
				)}
			</div>

			{/* Listings / Empty State */}
			{loadingListings ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
							<div className="flex">
								<div className="w-24 h-24 skeleton" />
								<div className="flex-1 p-4 space-y-2">
									<div className="h-4 w-3/4 skeleton" />
									<div className="h-5 w-1/4 skeleton" />
								</div>
							</div>
						</div>
					))}
				</div>
			) : listings.length === 0 ? (
				<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 text-center">
					<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<Package size={28} className="text-[var(--color-primary)]" />
					</div>
					<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
						No listings yet
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
						Post something and reach local buyers in your community.
					</p>
					<Link
						href="/add-listing"
						className="btn-primary inline-flex"
					>
						<Plus size={16} />
						Create your first listing
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{listings.map((item, i) => {
						const img = thumb(item);
						return (
							<div
								key={item.id}
								className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all animate-slide-up"
								style={{ animationDelay: `${i * 0.05}s` }}
							>
								<div className="flex">
									<Link
										href={`/product/${item.id}`}
										className="w-24 h-24 flex-shrink-0 relative block bg-gray-100 dark:bg-slate-700"
									>
										{img ? (
											<img src={img} alt={item.title} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Package size={24} className="text-gray-300" />
											</div>
										)}
										{item.is_verified && (
											<div className="absolute top-1 left-1 bg-blue-600 rounded p-0.5">
												<ShieldCheck size={10} className="text-white" />
											</div>
										)}
									</Link>
									<div className="flex-1 p-3.5 min-w-0 flex flex-col justify-between">
										<div>
											<div className="flex items-start justify-between gap-2">
												<Link
													href={`/product/${item.id}`}
													className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-[var(--color-primary)] transition"
												>
													{item.title}
												</Link>
												<button
													onClick={() => handleDelete(item.id)}
													disabled={deleting === item.id}
													className="text-gray-300 hover:text-red-500 p-1 transition flex-shrink-0"
												>
													{deleting === item.id ? (
														<div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
													) : (
														<Trash2 size={14} />
													)}
												</button>
											</div>
											<p className="text-lg font-extrabold text-[var(--color-primary)] mt-0.5">
												NPR {item.price?.toLocaleString()}
											</p>
											<div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
												{item.ai_condition_report && (
													<span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-semibold">
														{item.ai_condition_report}
													</span>
												)}
												<span className="flex items-center gap-1">
													<Clock size={10} /> {timeAgo(item.created_at)}
												</span>
												{item.manual_address && (
													<span className="flex items-center gap-1 truncate max-w-[80px]">
														<MapPin size={10} /> {item.manual_address}
													</span>
												)}
											</div>
										</div>
										{item.phone && (
											<div className="flex gap-2 mt-2">
												<button
													onClick={() => window.location.href = `tel:${item.phone}`}
													className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold hover:bg-blue-100 transition"
												>
													<Phone size={10} /> Call
												</button>
												<button
													onClick={() => {
														const msg = `Namaste! I saw your ${item.title} on NepConnect.`;
														window.open(
															`https://wa.me/977${item.phone?.replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
															"_blank",
														);
													}}
													className="flex-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold hover:bg-green-100 transition"
												>
													<MessageCircle size={10} /> WhatsApp
												</button>
											</div>
										)}
									</div>
								</div>
								{/* AI footer */}
								{item.ai_detected_item && (
									<div className="border-t border-gray-100 dark:border-slate-700 px-3.5 py-2 flex items-center gap-1.5 bg-gray-50/50 dark:bg-slate-700/50">
										<Sparkles size={10} className="text-blue-500" />
										<span className="text-[11px] text-gray-500 dark:text-gray-400">
											AI: {item.ai_detected_item}
										</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}