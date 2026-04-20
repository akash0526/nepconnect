"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase, getDeviceId } from "../lib/supabase";
import {
	Trash2,
	Search,
	Phone,
	MessageCircle,
	Plus,
	Camera,
	MapPin,
	Loader2,
	Sparkles,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";

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
			const { error } = await supabase
				.from("listings")
				.delete()
				.eq("id", id)
				.eq("user_id", myId);

			if (!error) setItems((prev) => prev.filter((item) => item.id !== id));
		}
	};

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

	const filteredItems = items.filter(
		(item) =>
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<main className="min-h-screen bg-gray-50 pb-24 font-sans">
			{/* Header */}
			<div className="bg-green-700 p-6 pb-12 text-white text-center rounded-b-[40px] shadow-lg">
				<h1 className="text-3xl font-extrabold tracking-tight">NepConnect</h1>
				<p className="text-sm opacity-90 mt-1">AI-Powered Local Marketplace</p>

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
				{/* Map */}
				<div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white mb-8 bg-white h-[300px]">
					<Map listings={filteredItems} />
				</div>

				<div className="flex items-center justify-between mb-6">
					<h2 className="font-bold text-xl text-gray-800">Nearby for You</h2>
					<span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
						{filteredItems.length} Listings
					</span>
				</div>

				{/* Items Grid */}
				<div className="grid gap-4">
					{loading ? (
						<div className="flex flex-col items-center py-20 text-gray-400">
							<Loader2 className="animate-spin mb-2" size={32} />
							<p className="text-sm">Finding neighbors...</p>
						</div>
					) : (
						filteredItems.map((item) => {
							const images =
								item.image_urls?.length > 0
									? item.image_urls
									: item.image_url
										? [item.image_url]
										: [];

							return (
								<div
									key={item.id}
									className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-row h-48 hover:shadow-md transition-shadow relative"
								>
									{/* Owner Delete Button */}
									{item.user_id === myId && (
										<button
											onClick={() => handleDelete(item.id)}
											className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-full shadow-lg z-20 active:scale-90 transition-all"
										>
											<Trash2 size={14} />
										</button>
									)}

									{/* Image Section */}
									<div className="w-1/3 bg-gray-100 relative group">
										<img
											src={images[0]}
											className="w-full h-full object-cover"
											alt={item.title}
										/>
										{item.is_verified && (
											<div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
												<ShieldCheck size={10} /> AI VERIFIED
											</div>
										)}
									</div>

									{/* Content Section */}
									<div className="w-2/3 p-4 flex flex-col justify-between">
										<div>
											<div className="flex justify-between items-start">
												<h3 className="font-bold text-gray-900 line-clamp-1 text-lg">
													{item.title}
												</h3>
												{item.ai_condition_score > 7 && (
													<Sparkles
														size={16}
														className="text-yellow-500 fill-yellow-500"
													/>
												)}
											</div>

											<p className="text-green-600 font-black text-xl">
												NPR {item.price}
											</p>

											{/* AI Condition Bar */}
											{item.ai_condition_score && (
												<div className="mt-2">
													<div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
														<span>CONDITION</span>
														<span>{item.ai_condition_score}/10</span>
													</div>
													<div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
														<div
															className={`h-full transition-all ${item.ai_condition_score > 7 ? "bg-green-500" : item.ai_condition_score > 4 ? "bg-yellow-500" : "bg-red-500"}`}
															style={{
																width: `${item.ai_condition_score * 10}%`,
															}}
														/>
													</div>
													<p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">
														"{item.ai_condition_report}"
													</p>
												</div>
											)}
										</div>

										{/* Action Buttons */}
										<div className="flex gap-2 mt-2">
											<a
												href={`tel:${item.phone}`}
												className="flex-1 bg-blue-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
											>
												<Phone size={14} /> Call
											</a>
											<a
												href={`https://wa.me/977${item.phone?.replace(/\s/g, "")}?text=Namaste! I saw your ${item.title} on NepConnect.`}
												className="flex-1 bg-green-500 text-white py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
											>
												<MessageCircle size={14} /> Chat
											</a>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Floating Action Button */}
			<Link
				href="/add-listing"
				className="fixed bottom-8 right-6 bg-green-600 text-white p-5 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
			>
				<Plus size={28} />
			</Link>
		</main>
	);
}
