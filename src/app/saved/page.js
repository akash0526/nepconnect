"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, getDeviceId } from "../../lib/supabase";
import { Heart, Loader2, Trash2, MapPin, Phone, MessageCircle, Clock, Package, ArrowLeft } from "lucide-react";

export default function SavedPage() {
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(true);
	const userId = getDeviceId();

	useEffect(() => {
		if (!userId) { setLoading(false); return; }
		loadFavorites();
	}, []);

	const loadFavorites = async () => {
		const { data, error } = await supabase
			.from("favorites")
			.select("*, listings(*)")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });
		if (!error) setFavorites(data || []);
		setLoading(false);
	};

	const removeFavorite = async (favId) => {
		await supabase.from("favorites").delete().eq("id", favId);
		setFavorites((prev) => prev.filter((f) => f.id !== favId));
	};

	const timeAgo = (d) => {
		const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		return `${days}d ago`;
	};

	const handleContact = (phone, title) => {
		const message = `Namaste! I saw your ${title} on NepConnect.`;
		window.open(`https://wa.me/977${phone?.replace(/\s/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
	};

	return (
		<div className="pb-24">
			<div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
						<Heart className="fill-white" size={24} /> Saved Items
					</h1>
					<p className="text-sm text-white/80 font-medium mt-1">
						{favorites.length} saved {favorites.length === 1 ? "item" : "items"}
					</p>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
				</div>
			) : favorites.length === 0 ? (
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-slate-700">
					<div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<Heart size={28} className="text-pink-500" />
					</div>
					<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">No saved items</h3>
					<p className="text-sm text-gray-500 mb-6">Tap the heart icon on any listing to save it here.</p>
					<Link href="/" className="btn-primary inline-flex text-sm">
						Browse Listings
					</Link>
				</div>
			) : (
				<div className="space-y-3">
					{favorites.map((fav) => {
						const item = fav.listings;
						if (!item) return null;
						const img = item.image_urls?.length ? item.image_urls[0] : item.image_url || null;
						return (
							<div key={fav.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
								<Link href={`/product/${item.id}`} className="flex">
									<div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-slate-700">
										{img ? (
											<img src={img} alt={item.title} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Package size={24} className="text-gray-300" />
											</div>
										)}
									</div>
									<div className="flex-1 p-3 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</h3>
											<button onClick={(e) => { e.preventDefault(); removeFavorite(fav.id); }} className="text-gray-300 hover:text-red-500 transition p-1 flex-shrink-0">
												<Trash2 size={13} />
											</button>
										</div>
										<p className="text-base font-extrabold text-[var(--color-primary)] mt-0.5">
											NPR {Number(item.price).toLocaleString()}
										</p>
										<div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
											{item.manual_address && (
												<span className="flex items-center gap-1 truncate max-w-[100px]">
													<MapPin size={9} /> {item.manual_address}
												</span>
											)}
											<span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(fav.created_at)}</span>
										</div>
										{item.phone && (
											<button
												onClick={(e) => { e.preventDefault(); handleContact(item.phone, item.title); }}
												className="mt-2 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 w-fit hover:bg-green-100 transition"
											>
												<MessageCircle size={12} /> WhatsApp
											</button>
										)}
									</div>
								</Link>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}