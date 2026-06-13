"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, MapPin, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NEPALI_MONTHS = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कात्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"];

export default function MarketPricesPage() {
	const [prices, setPrices] = useState([]);
	const [allCrops, setAllCrops] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [selectedCrop, setSelectedCrop] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	useEffect(() => {
		fetchPrices();
	}, []);

	const fetchPrices = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/market-prices");
			const data = await res.json();
			setPrices(data.prices || []);
			setAllCrops(data.crops || []);
			setLastUpdated(data.updated_at);
		} catch (err) {
			console.error("Failed to fetch prices:", err);
		}
		setLoading(false);
	};

	const filteredPrices = useMemo(() => {
		let result = prices;
		if (selectedCrop) {
			result = result.filter((p) => p.crop === selectedCrop);
		}
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				(p) =>
					p.crop.toLowerCase().includes(q) ||
					p.variety.toLowerCase().includes(q),
			);
		}
		return result;
	}, [prices, search, selectedCrop]);

	const cropGroups = useMemo(() => {
		const groups = {};
		filteredPrices.forEach((p) => {
			if (!groups[p.crop]) groups[p.crop] = [];
			groups[p.crop].push(p);
		});
		return groups;
	}, [filteredPrices]);

	const today = new Date();
	const month = NEPALI_MONTHS[today.getMonth()];
	const dateStr = `${today.getDate()} ${month}, ${today.getFullYear()}`;

	return (
		<div className="pb-24">
			<div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
						📊 Market Prices
					</h1>
					<p className="text-sm text-white/80 font-medium mt-1">
						Current mandi / wholesale prices in Nepal | {dateStr}
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative mb-5">
				<Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					value={search}
					onChange={(e) => { setSearch(e.target.value); setSelectedCrop(null); }}
					placeholder="Search crop (e.g., धान, rice, आलु...)"
					className="w-full py-3.5 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
				/>
			</div>

			{/* Crop quick selector */}
			<div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-5">
				<button
					onClick={() => setSelectedCrop(null)}
					className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
						!selectedCrop
							? "bg-amber-500 text-white shadow-md"
							: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
					}`}
				>
					All ({prices.length})
				</button>
				{allCrops.slice(0, 15).map((crop) => (
					<button
						key={crop}
						onClick={() => { setSelectedCrop(crop); setSearch(""); }}
						className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
							selectedCrop === crop
								? "bg-amber-500 text-white shadow-md"
								: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
						}`}
					>
						{crop.split("(")[1]?.split(")")[0] || crop}
					</button>
				))}
			</div>

			{/* Refresh */}
			<div className="flex items-center justify-between mb-4">
				<p className="text-xs text-gray-500">
					{filteredPrices.length} items found
				</p>
				<button
					onClick={fetchPrices}
					disabled={loading}
					className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition disabled:opacity-50"
				>
					<RefreshCw size={13} className={loading ? "animate-spin" : ""} />
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="animate-spin text-amber-500" size={32} />
				</div>
			) : Object.keys(cropGroups).length === 0 ? (
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-slate-700">
					<div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
						🔍
					</div>
					<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">No prices found</h3>
					<p className="text-sm text-gray-500">Try searching for a different crop name.</p>
				</div>
			) : (
				<div className="space-y-3">
					{Object.entries(cropGroups).map(([crop, items]) => (
						<div key={crop} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
							<div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800">
								<h3 className="font-bold text-gray-900 dark:text-gray-100">{crop}</h3>
							</div>
							<div className="divide-y divide-gray-50 dark:divide-slate-700">
								{items.map((item, i) => (
									<div key={i} className="px-4 py-3 flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.variety}</p>
											<p className="text-[10px] text-gray-400">per {item.unit}</p>
										</div>
										<div className="text-right">
											<div className="flex items-center gap-2">
												<span className="text-sm text-gray-400 line-through">NPR {item.max}</span>
												<span className="text-lg font-extrabold text-[var(--color-primary)]">
													NPR {item.avg}
												</span>
											</div>
											<p className="text-[10px] text-gray-400">
												Range: NPR {item.min} - {item.max}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Source disclaimer */}
			<div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
				<p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5 font-medium">
					<MapPin size={12} /> Data source: Nepal Agricultural Market Database
				</p>
				<p className="text-[10px] text-blue-500 mt-1">
					Prices are indicative and may vary by location and season.
					{lastUpdated && ` Last updated: ${new Date(lastUpdated).toLocaleDateString()}`}
				</p>
			</div>
		</div>
	);
}