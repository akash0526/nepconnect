"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabase";
import { getDeviceId } from "../lib/supabase";
import { Trash2 } from "lucide-react";
import {
	Search,
	Phone,
	MessageCircle,
	Plus,
	Camera,
	MapPin,
	Loader2,
} from "lucide-react";
import Link from "next/link";

// Load Map dynamically to prevent SSR errors
const Map = dynamic(() => import("../components/MapExploler"), {
	ssr: false,
	loading: () => (
		<div className="h-[300px] w-full bg-gray-100 animate-pulse flex items-center justify-center">
			Loading Map...
		</div>
	),
});

export default function Home() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const myId = getDeviceId();

	const handleDelete = async (id) => {
		if (
			confirm("Has this been sold? Removing this will hide it from the map.")
		) {
			// We add .eq("user_id", myId) as an extra security layer
			const { error } = await supabase
				.from("listings")
				.delete()
				.eq("id", id)
				.eq("user_id", myId);

			if (error) {
				alert("Error deleting item: " + error.message);
			} else {
				// Optimistic UI update: remove from state so it disappears instantly
				// without a full page reload
				setItems((prevItems) => prevItems.filter((item) => item.id !== id));
			}
		}
	};
	// const handleDelete = async (id) => {
	// 	if (
	// 		confirm("Has this been sold? Removing this will hide it from the map.")
	// 	) {
	// 		const { error } = await supabase.from("listings").delete().eq("id", id);
	// 		if (!error) window.location.reload(); // Refresh to show it's gone
	// 	}
	// };
	useEffect(() => {
		const fetchItems = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from("listings")
				.select("*")
				.order("created_at", { ascending: false });

			if (!error) setItems(data || []);
			setLoading(false);
		};
		fetchItems();
	}, []);

	// Filter logic for search
	const filteredItems = items.filter(
		(item) =>
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<main className="min-h-screen bg-gray-50 pb-24 font-sans">
			{/* Header Section */}
			<div className="bg-green-700 p-6 pb-12 text-white text-center rounded-b-[40px] shadow-lg">
				<h1 className="text-3xl font-extrabold tracking-tight">NepConnect</h1>
				<p className="text-sm opacity-90 mt-1">
					Connecting Local Talent & Fresh Produce
				</p>

				{/* Search Bar */}
				<div className="max-w-md mx-auto mt-6 relative">
					<Search
						className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Search items, skills, or locations..."
						className="w-full py-3 px-12 rounded-2xl text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-green-400 transition"
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="p-4 max-w-xl mx-auto -mt-8">
				{/* Map Section */}
				<div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white mb-8 bg-white h-[300px]">
					<Map listings={filteredItems} />
				</div>

				<div className="flex items-center justify-between mb-6">
					<h2 className="font-bold text-xl text-gray-800">Nearby for You</h2>
					<span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
						{filteredItems.length} Listings
					</span>
				</div>

				{/* Items Section: Horizontal Modern Layout */}
				<div className="grid gap-4">
					{loading ? (
						<div className="flex flex-col items-center py-20 text-gray-400">
							<Loader2 className="animate-spin mb-2" size={32} />
							<p className="text-sm">Finding neighbors...</p>
						</div>
					) : filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<div
								key={item.id}
								className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-row h-40 hover:shadow-md transition-shadow active:scale-[0.98]"
							>
								{/* Left Side: Product Image */}
								{item.user_id === myId && (
									<button
										onClick={() => handleDelete(item.id)}
										className="absolute top-2 left-2 bg-red-600/90 text-white p-2 rounded-full shadow-lg z-10 hover:bg-red-700 active:scale-90 transition-all"
									>
										<Trash2 size={16} />
									</button>
								)}
								{/* ------------------------------------------ */}
								<div className="w-1/3 bg-gray-100 relative">
									{item.image_url ? (
										<img
											src={item.image_url}
											alt={item.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex flex-col items-center justify-center h-full text-gray-300">
											<Camera size={24} />
										</div>
									)}
								</div>

								{/* Right Side: Details & Actions */}
								<div className="w-2/3 p-3 flex flex-col justify-between">
									<div>
										<div className="flex justify-between items-start">
											<h3 className="font-bold text-gray-900 line-clamp-1 leading-tight">
												{item.title}
											</h3>
											<span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100 font-bold uppercase shrink-0">
												{item.category || "Local"}
											</span>
										</div>
										<p className="text-green-600 font-black text-lg mt-0.5">
											NPR {item.price}
										</p>
										<div className="text-gray-400 text-[10px] flex items-center gap-1 mt-1 font-medium">
											<MapPin size={10} className="text-red-400" />
											<span>Location Captured</span>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2 mt-2">
										<a
											href={`tel:${item.phone}`}
											className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-blue-100 transition active:bg-blue-200"
										>
											<Phone size={14} /> Call
										</a>
										<a
											href={`https://wa.me/977${item.phone?.replace(/\s/g, "")}?text=Namaste! I saw your ${item.title} on NepConnect. Is it still available?`}
											target="_blank"
											rel="noopener noreferrer"
											className="..."
										>
											<MessageCircle size={14} /> Chat
										</a>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400">
							<Search size={40} className="mx-auto mb-2 opacity-20" />
							<p>No listings found in your area yet.</p>
						</div>
					)}
				</div>
			</div>

			{/* Floating Action Button (FAB) */}
			<Link
				href="/add-listing"
				className="fixed bottom-8 right-6 bg-green-600 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all z-50 flex items-center justify-center"
			>
				<Plus size={32} />
			</Link>
		</main>
	);
}
