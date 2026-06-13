"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase, getDeviceId } from "../lib/supabase";
import {
	Trash2,
	Search,
	Phone,
	MessageCircle,
	Plus,
	Loader2,
	ShieldCheck,
	LogIn,
	MapPin,
	Clock,
	ChevronRight,
	SlidersHorizontal,
	X,
	Sparkles,
	AlertCircle,
	Package,
	Navigation,
	Flower2,
	BarChart3,
	CalendarDays,
	Heart,
	Bell,
	RotateCcw,
	Smartphone,
	Mic,
	Store,
} from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import RadiusFilter from "../components/ui/RadiusFilter";

const Map = dynamic(() => import("../components/MapExploler"), {
	ssr: false,
	loading: () => (
		<div className="h-[280px] w-full rounded-2xl skeleton flex items-center justify-center">
			<Loader2 className="animate-spin text-gray-400" size={24} />
		</div>
	),
});

// ── Feature Cards Data ──
const FEATURES = [
	{
		id: "farmer",
		href: "/farmer",
		icon: Flower2,
		label: "Farmer Hub",
		labelNe: "किसान हब",
		desc: "Weather, crop doctor, planting calendar & rotation advisor",
		descNe: "मौसम, बाली डाक्टर, रोप्ने क्यालेन्डर र बाली चक्र",
		color: "from-green-500 to-emerald-600",
		shadow: "shadow-green-200",
		emoji: "🌾",
	},
	{
		id: "market-prices",
		href: "/market-prices",
		icon: BarChart3,
		label: "Market Prices",
		labelNe: "बजार मूल्य",
		desc: "50+ crop & vegetable wholesale prices in Nepal",
		descNe: "५० भन्दा बढी बाली र तरकारीको थोक मूल्य",
		color: "from-amber-500 to-orange-600",
		shadow: "shadow-amber-200",
		emoji: "📊",
	},
	{
		id: "saved",
		href: "/saved",
		icon: Heart,
		label: "Wishlist",
		labelNe: "मनपर्ने",
		desc: "Save listings you're interested in",
		descNe: "तपाईंलाई मनपर्ने सूचीहरू सेभ गर्नुहोस्",
		color: "from-pink-500 to-rose-600",
		shadow: "shadow-pink-200",
		emoji: "❤️",
	},
	{
		id: "notifications",
		href: "/notifications",
		icon: Bell,
		label: "Notifications",
		labelNe: "सूचनाहरू",
		desc: "Messages, reviews, price drops & alerts",
		descNe: "सन्देश, समीक्षा, मूल्य घटेको र सूचनाहरू",
		color: "from-blue-500 to-indigo-600",
		shadow: "shadow-blue-200",
		emoji: "🔔",
	},
	{
		id: "voice",
		href: "/farmer", // goes to farmer hub tools tab
		icon: Mic,
		label: "Voice Input",
		labelNe: "भ्वाइस इनपुट",
		desc: "Speak in Nepali, no typing needed",
		descNe: "नेपालीमा बोल्नुहोस्, टाइप गर्नु पर्दैन",
		color: "from-teal-500 to-cyan-600",
		shadow: "shadow-teal-200",
		emoji: "🎤",
	},
	{
		id: "calendar",
		href: "/farmer",
		icon: CalendarDays,
		label: "Planting Calendar",
		labelNe: "रोप्ने क्यालेन्डर",
		desc: "When to plant & harvest 14+ Nepali crops",
		descNe: "१४ भन्दा बढी नेपाली बाली कहिले रोप्ने र काट्ने",
		color: "from-purple-500 to-indigo-600",
		shadow: "shadow-purple-200",
		emoji: "🗓️",
	},
	{
		id: "rotation",
		href: "/farmer",
		icon: RotateCcw,
		label: "Crop Rotation",
		labelNe: "बाली चक्र",
		desc: "AI recommends what to plant next",
		descNe: "AI ले अर्को के रोप्ने सुझाव दिन्छ",
		color: "from-rose-500 to-pink-600",
		shadow: "shadow-rose-200",
		emoji: "🔄",
	},
	{
		id: "sms",
		href: "/farmer",
		icon: Smartphone,
		label: "SMS Alerts",
		labelNe: "SMS सूचना",
		desc: "Weather & market alerts via SMS",
		descNe: "मौसम र बजार जानकारी SMS मा",
		color: "from-sky-500 to-blue-600",
		shadow: "shadow-sky-200",
		emoji: "📱",
	},
];

const CATEGORIES = [
	{ id: "all", label: "All", icon: "🔥", color: "bg-gray-100 text-gray-700" },
	{
		id: "Agriculture",
		label: "Agriculture",
		icon: "🌾",
		color: "bg-green-100 text-green-700",
	},
	{
		id: "Electronics",
		label: "Electronics",
		icon: "📱",
		color: "bg-blue-100 text-blue-700",
	},
	{
		id: "Fashion",
		label: "Fashion",
		icon: "👕",
		color: "bg-pink-100 text-pink-700",
	},
	{
		id: "Home & Garden",
		label: "Home & Garden",
		icon: "🏡",
		color: "bg-amber-100 text-amber-700",
	},
	{
		id: "Handmade",
		label: "Handmade",
		icon: "✋",
		color: "bg-purple-100 text-purple-700",
	},
	{
		id: "Home Service",
		label: "Services",
		icon: "🔧",
		color: "bg-orange-100 text-orange-700",
	},
	{
		id: "Sports & Outdoors",
		label: "Sports",
		icon: "⚽",
		color: "bg-indigo-100 text-indigo-700",
	},
	{
		id: "Toys & Games",
		label: "Toys",
		icon: "🎮",
		color: "bg-rose-100 text-rose-700",
	},
	{
		id: "Beauty & Health",
		label: "Beauty",
		icon: "💄",
		color: "bg-fuchsia-100 text-fuchsia-700",
	},
];

function ListingSkeleton() {
	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
			<div className="flex">
				<div className="w-1/3 h-40 skeleton" />
				<div className="w-2/3 p-4 space-y-3">
					<div className="h-4 w-3/4 skeleton" />
					<div className="h-6 w-1/3 skeleton" />
					<div className="h-3 w-full skeleton" />
					<div className="flex gap-2">
						<div className="h-8 w-1/2 skeleton rounded-xl" />
						<div className="h-8 w-1/2 skeleton rounded-xl" />
					</div>
				</div>
			</div>
		</div>
	);
}

function EmptyState({ searchQuery, category }) {
	const { lang } = useLanguage();
	return (
		<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
			<div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
				<Package size={28} className="text-gray-400" />
			</div>
			<h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
				{lang === "ne" ? "केहि फेला परेन" : "Nothing Found"}
			</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
				{searchQuery
					? lang === "ne"
						? `"${searchQuery}" को लागि कुनै सूची फेला परेन`
						: `No listings found for "${searchQuery}"`
					: lang === "ne"
						? "यस श्रेणीमा कुनै सूची छैन। पहिलो हुनुहोस्!"
						: "No listings in this category yet. Be the first!"}
			</p>
			<Link href="/add-listing" className="mt-5 btn-primary text-sm">
				<Plus size={16} /> {lang === "ne" ? "नयाँ सूची थप्नुहोस्" : "Add Listing"}
			</Link>
		</div>
	);
}

function ListingCard({ item, isGuest, myId, onDelete, onGalleryOpen }) {
	const images =
		item.image_urls?.length > 0
			? item.image_urls
			: item.image_url
				? [item.image_url]
				: [];
	const isOwner = !isGuest && item.user_id === myId;
	const timeAgo = getTimeAgo(item.created_at);

	return (
		<Link
			href={`/product/${item.id}`}
			className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-row hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-600 transition-all duration-200 active:scale-[0.99]"
		>
			<div
				className="w-[35%] min-h-[170px] bg-gray-100 dark:bg-slate-700 relative overflow-hidden cursor-pointer flex-shrink-0"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					if (images.length > 0) onGalleryOpen(e, images, 0);
				}}
			>
				{images[0] ? (
					<img
						src={images[0]}
						className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
						alt={item.title}
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Package size={32} className="text-gray-300" />
					</div>
				)}
				<div className="absolute top-2 left-2 flex flex-col gap-1">
					{item.is_verified && (
						<div className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-lg">
							<ShieldCheck size={8} /> AI
						</div>
					)}
					{item.ai_condition_report && (
						<div
							className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm text-white ${getConditionColor(item.ai_condition_report)}`}
						>
							{item.ai_condition_report}
						</div>
					)}
				</div>
				{images.length > 1 && (
					<div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
						+{images.length - 1}
					</div>
				)}
				{isOwner && (
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onDelete(item.id);
						}}
						className="absolute bottom-2 left-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-lg transition-all z-10"
					>
						<Trash2 size={12} />
					</button>
				)}
			</div>
			<div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
				<div>
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-bold text-[15px] text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight">
							{item.title}
						</h3>
						{item.category && (
							<span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
								{CATEGORIES.find((c) => c.id === item.category)?.icon || "📦"}
							</span>
						)}
					</div>
					<p className="text-lg font-extrabold text-[var(--color-primary)] mt-0.5">
						NPR {Number(item.price).toLocaleString()}
					</p>
					{item.description && (
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
							{item.description}
						</p>
					)}
					<div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
						{item.manual_address && (
							<span className="flex items-center gap-1 truncate max-w-[120px]">
								<MapPin size={10} /> {item.manual_address}
							</span>
						)}
						<span className="flex items-center gap-1 flex-shrink-0">
							<Clock size={10} /> {timeAgo}
						</span>
					</div>
				</div>
				<div className="flex gap-2 mt-2.5">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							window.location.href = `tel:${item.phone}`;
						}}
						className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[11px] hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all"
					>
						<Phone size={12} /> Call
					</button>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							const msg = `Namaste! I saw your ${item.title} on NepConnect.`;
							window.open(
								`https://wa.me/977${item.phone?.replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
								"_blank",
							);
						}}
						className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[11px] hover:shadow-lg hover:shadow-green-200 active:scale-95 transition-all"
					>
						<MessageCircle size={12} /> Chat
					</button>
				</div>
			</div>
		</Link>
	);
}

const getConditionColor = (condition) => {
	const map = {
		New: "bg-emerald-600",
		"Like New": "bg-green-500",
		Good: "bg-yellow-500",
		Fair: "bg-orange-500",
		"For Parts": "bg-red-500",
	};
	return map[condition] || "bg-gray-400";
};

const getTimeAgo = (dateStr) => {
	const days = Math.floor(
		(Date.now() - new Date(dateStr).getTime()) / 86400000,
	);
	if (days === 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days}d ago`;
	if (days < 30) return `${Math.floor(days / 7)}w ago`;
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
};

export default function Home() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isGuest, setIsGuest] = useState(true);
	const [galleryImages, setGalleryImages] = useState([]);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [nearbyItems, setNearbyItems] = useState(null);
	const [radius, setRadius] = useState(0);

	const myId = getDeviceId();
	const searchRef = useRef(null);
	const { lang } = useLanguage();

	useEffect(() => {
		const checkAuth = async () => {
			const res = await fetch("/api/me", { credentials: "include" }).catch(
				() => null,
			);
			if (res && res.ok) setIsGuest(false);
		};
		checkAuth();
	}, []);

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

	const handleDelete = async (id) => {
		if (confirm("Mark as sold?")) {
			const { error } = await supabase
				.from("listings")
				.delete()
				.eq("id", id)
				.eq("user_id", myId);
			if (!error) setItems((prev) => prev.filter((item) => item.id !== id));
		}
	};

	const displayItems = nearbyItems || items;
	const filteredItems = useMemo(() => {
		return displayItems.filter((item) => {
			const matchesSearch =
				!searchQuery ||
				item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || item.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [displayItems, searchQuery, selectedCategory]);

	const handleRadiusChange = (val) => {
		setRadius(val);
		if (val === 0) setNearbyItems(null);
	};
	const openGallery = (e, images, startIndex = 0) => {
		e.preventDefault();
		e.stopPropagation();
		setGalleryImages(images);
		setGalleryIndex(startIndex);
	};
	const nextImage = () =>
		setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
	const prevImage = () =>
		setGalleryIndex(
			(prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
		);

	return (
		<>
			{/* ════════════════════════════════════════ */}
			{/* 🏆 HERO — What NepConnect Is */}
			{/* ════════════════════════════════════════ */}
			<div className="bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-emerald-800 rounded-3xl p-6 pt-8 pb-12 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<div className="flex items-center justify-between mb-1">
						<h1 className="text-2xl font-black tracking-tight">
							{lang === "ne" ? "नेपकनेक्ट" : "NepConnect"}
						</h1>
						<span className="text-[10px] font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
							AI-Powered
						</span>
					</div>
					<p className="text-sm text-white/80 font-medium">
						{lang === "ne"
							? "नेपालको स्थानीय बजार र किसान सहायता — एउटै ठाउँमा"
							: "Nepal's Local Marketplace & Farmer Tools — All in One Place"}
					</p>

					{/* Search */}
					<div className="mt-5 relative group">
						<Search
							size={18}
							className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
						/>
						<input
							ref={searchRef}
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder={
								lang === "ne"
									? "खोज्नुहोस् (वस्तु, बाली, सेवा)..."
									: "Search items, crops, services..."
							}
							className="w-full py-3.5 px-12 rounded-2xl text-gray-900 shadow-lg outline-none focus:ring-4 focus:ring-white/30 transition-all bg-white/95 backdrop-blur-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
							>
								<X size={16} />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 🌟 FEATURE HUB — All Features at a Glance */}
			{/* ════════════════════════════════════════ */}
			<div className="mb-8">
				<h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
					<Sparkles size={18} className="text-[var(--color-primary)]" />
					{lang === "ne" ? "सबै सुविधाहरू" : "Explore NepConnect"}
				</h2>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
					{FEATURES.map((feature) => {
						const Icon = feature.icon;
						return (
							<Link
								key={feature.id}
								href={feature.href}
								className={`bg-gradient-to-br ${feature.color} text-white rounded-2xl p-4 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all ${feature.shadow} relative overflow-hidden group`}
							>
								<div className="absolute -bottom-4 -right-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
									{feature.emoji}
								</div>
								<Icon size={22} className="mb-2" />
								<p className="font-bold text-sm leading-tight">
									{lang === "ne" ? feature.labelNe : feature.label}
								</p>
								<p className="text-[9px] text-white/70 mt-1 line-clamp-2">
									{lang === "ne" ? feature.descNe : feature.desc}
								</p>
							</Link>
						);
					})}
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 🌾 QUICK FARMER TOOLS ROW */}
			{/* ════════════════════════════════════════ */}
			<div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800">
				<div className="flex items-center justify-between mb-3">
					<h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Flower2 size={18} className="text-green-600" />
						{lang === "ne" ? "किसान सहायक" : "Farmer Tools"}
					</h2>
					<Link
						href="/farmer"
						className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
					>
						{lang === "ne" ? "सबै हेर्नुहोस्" : "View All"}{" "}
						<ChevronRight size={12} />
					</Link>
				</div>
				<div className="grid grid-cols-4 gap-2">
					<Link
						href="/farmer"
						className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center hover:shadow-md transition"
					>
						<span className="text-2xl">🌤️</span>
						<p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">
							{lang === "ne" ? "मौसम" : "Weather"}
						</p>
					</Link>
					<Link
						href="/farmer"
						className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center hover:shadow-md transition"
					>
						<span className="text-2xl">🔬</span>
						<p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">
							{lang === "ne" ? "बाली डाक्टर" : "Crop Doctor"}
						</p>
					</Link>
					<Link
						href="/market-prices"
						className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center hover:shadow-md transition"
					>
						<span className="text-2xl">📊</span>
						<p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">
							{lang === "ne" ? "बजार मूल्य" : "Market Price"}
						</p>
					</Link>
					<Link
						href="/farmer"
						className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center hover:shadow-md transition"
					>
						<span className="text-2xl">🗓️</span>
						<p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">
							{lang === "ne" ? "क्यालेन्डर" : "Calendar"}
						</p>
					</Link>
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 📢 GUEST BANNER */}
			{/* ════════════════════════════════════════ */}
			{isGuest && (
				<div className="animate-slide-down bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 mb-5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-xl flex items-center justify-center flex-shrink-0">
							<AlertCircle
								size={20}
								className="text-amber-700 dark:text-amber-300"
							/>
						</div>
						<div>
							<p className="text-sm font-bold text-amber-800 dark:text-amber-200">
								{lang === "ne" ? "पाहुना" : "Guest Mode"}
							</p>
							<p className="text-xs text-amber-600 dark:text-amber-400">
								{lang === "ne"
									? "बेच्न, मनपर्ने र थपको लागि लगइन गर्नुहोस्"
									: "Login to sell, save & more"}
							</p>
						</div>
					</div>
					<Link
						href="/login"
						className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap active:scale-95"
					>
						<LogIn size={13} /> {lang === "ne" ? "लगइन" : "Login"}
					</Link>
				</div>
			)}

			{/* ════════════════════════════════════════ */}
			{/* 📍 MARKETPLACE SECTION */}
			{/* ════════════════════════════════════════ */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Store size={18} className="text-[var(--color-primary)]" />
						{lang === "ne" ? "बजार" : "Marketplace"}
					</h2>
					<Link
						href={isGuest ? "/login" : "/add-listing"}
						className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[var(--color-primary-dark)] transition shadow-sm"
					>
						<Plus size={14} />
						{lang === "ne" ? "बेच्नुहोस्" : "Sell"}
					</Link>
				</div>

				{/* Radius Filter */}
				<div className="mb-3">
					<RadiusFilter
						currentRadius={radius}
						onRadiusChange={handleRadiusChange}
						onLocationItems={setNearbyItems}
					/>
					{nearbyItems !== null && (
						<p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
							<Navigation size={10} className="text-[var(--color-primary)]" />
							Showing items within {radius} km
							<button
								onClick={() => {
									setNearbyItems(null);
									setRadius(0);
								}}
								className="text-red-500 hover:underline ml-1"
							>
								Clear
							</button>
						</p>
					)}
				</div>

				{/* Categories */}
				<div className="mb-4">
					<div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
						{CATEGORIES.map((cat) => (
							<button
								key={cat.id}
								onClick={() => setSelectedCategory(cat.id)}
								className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
									selectedCategory === cat.id
										? "bg-[var(--color-primary)] text-white shadow-lg shadow-green-200 dark:shadow-green-900/30 scale-105"
										: cat.color + " hover:opacity-80"
								}`}
							>
								<span className="text-sm">{cat.icon}</span> {cat.label}
							</button>
						))}
					</div>
				</div>

				{/* Map */}
				<div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 bg-white mb-5 h-[260px]">
					<Map listings={filteredItems} />
				</div>

				{/* Section Header */}
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-bold text-gray-900 dark:text-gray-100">
						{lang === "ne" ? "सूचीहरू" : "Listings"}
					</h3>
					<span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-green-900/30 px-3 py-1 rounded-full">
						{filteredItems.length}
						{lang === "ne" ? " वटा" : " items"}
					</span>
				</div>

				{/* Listing Cards */}
				{loading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<ListingSkeleton key={i} />
						))}
					</div>
				) : filteredItems.length === 0 ? (
					<EmptyState searchQuery={searchQuery} category={selectedCategory} />
				) : (
					<div className="space-y-3">
						{filteredItems.slice(0, 10).map((item) => (
							<ListingCard
								key={item.id}
								item={item}
								isGuest={isGuest}
								myId={myId}
								onDelete={handleDelete}
								onGalleryOpen={openGallery}
							/>
						))}
						{filteredItems.length > 10 && (
							<Link
								href="/?show=all"
								className="block text-center text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-green-900/30 py-3 rounded-2xl hover:bg-green-200 transition"
							>
								{lang === "ne" ? "सबै हेर्नुहोस् (+" : "View all (+"}
								{filteredItems.length - 10}
								{")"}
							</Link>
						)}
					</div>
				)}
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 📊 QUICK MARKET PRICES SNEAK PEAK */}
			{/* ════════════════════════════════════════ */}
			<div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800">
				<div className="flex items-center justify-between mb-3">
					<h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<BarChart3 size={18} className="text-amber-600" />
						{lang === "ne" ? "बजार मूल्य" : "Market Prices"}
					</h2>
					<Link
						href="/market-prices"
						className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
					>
						{lang === "ne" ? "सबै" : "All Prices"} <ChevronRight size={12} />
					</Link>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{[
						{ crop: "धान (Rice)", price: "NPR 46-52/kg", emoji: "🌾" },
						{ crop: "आलु (Potato)", price: "NPR 38-42/kg", emoji: "🥔" },
						{ crop: "प्याज (Onion)", price: "NPR 45-55/kg", emoji: "🧅" },
						{ crop: "टमाटर (Tomato)", price: "NPR 60-70/kg", emoji: "🍅" },
					].map((item) => (
						<div
							key={item.crop}
							className="bg-white dark:bg-slate-700 rounded-xl p-3 text-center"
						>
							<span className="text-xl">{item.emoji}</span>
							<p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 mt-1">
								{item.crop}
							</p>
							<p className="text-xs font-extrabold text-[var(--color-primary)]">
								{item.price}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 💡 WHY NEPCONNECT? */}
			{/* ════════════════════════════════════════ */}
			<div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
				<h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 text-center">
					{lang === "ne" ? "किन नेपकनेक्ट?" : "Why NepConnect?"}
				</h2>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
					<div>
						<div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
							<Sparkles size={18} className="text-green-600" />
						</div>
						<p className="text-xs font-bold text-gray-800 dark:text-gray-200">
							{lang === "ne" ? "AI-सहायता" : "AI-Powered"}
						</p>
						<p className="text-[9px] text-gray-400 mt-0.5">
							{lang === "ne"
								? "स्मार्ट सुझाव र विश्लेषण"
								: "Smart suggestions & analysis"}
						</p>
					</div>
					<div>
						<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
							<MapPin size={18} className="text-blue-600" />
						</div>
						<p className="text-xs font-bold text-gray-800 dark:text-gray-200">
							{lang === "ne" ? "स्थानीय" : "Local"}
						</p>
						<p className="text-[9px] text-gray-400 mt-0.5">
							{lang === "ne" ? "तपाईंको छिमेकमा" : "In your neighborhood"}
						</p>
					</div>
					<div>
						<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
							<Flower2 size={18} className="text-purple-600" />
						</div>
						<p className="text-xs font-bold text-gray-800 dark:text-gray-200">
							{lang === "ne" ? "किसान-मैत्री" : "Farmer-Friendly"}
						</p>
						<p className="text-[9px] text-gray-400 mt-0.5">
							{lang === "ne" ? "बाली, मौसम, मूल्य" : "Crops, weather, prices"}
						</p>
					</div>
					<div>
						<div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
							<Smartphone size={18} className="text-amber-600" />
						</div>
						<p className="text-xs font-bold text-gray-800 dark:text-gray-200">
							{lang === "ne" ? "अफलाइन सक्षम" : "Offline-Ready"}
						</p>
						<p className="text-[9px] text-gray-400 mt-0.5">
							{lang === "ne" ? "नेटवर्क नभए पनि" : "Works without internet"}
						</p>
					</div>
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 📌 BOTTOM CTA */}
			{/* ════════════════════════════════════════ */}
			<div className="bg-gradient-to-br from-[var(--color-primary)] to-emerald-700 rounded-3xl p-6 text-white text-center shadow-lg mb-8 -mx-4">
				<h2 className="text-xl font-black mb-2">
					{lang === "ne" ? "आजै सुरु गर्नुहोस्" : "Get Started Today"}
				</h2>
				<p className="text-sm text-white/80 mb-5 max-w-md mx-auto">
					{lang === "ne"
						? "बेच्नुहोस्, किन्नुहोस्, बाली जाँच गर्नुहोस् — सबै एकै ठाउँमा"
						: "Sell, buy, check crops & weather — all in one place"}
				</p>
				<div className="flex flex-wrap justify-center gap-3">
					{isGuest ? (
						<Link
							href="/login"
							className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
						>
							{lang === "ne" ? "नि:शुल्क साइन अप" : "Free Sign Up"} →
						</Link>
					) : (
						<Link
							href="/add-listing"
							className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
						>
							{lang === "ne" ? "बेच्नुहोस्" : "Sell Something"} →
						</Link>
					)}
					<Link
						href="/farmer"
						className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
					>
						🌾 {lang === "ne" ? "किसान हब" : "Farmer Hub"}
					</Link>
				</div>
			</div>

			{/* ════════════════════════════════════════ */}
			{/* 🖼️ GALLERY LIGHTBOX */}
			{/* ════════════════════════════════════════ */}
			{galleryImages.length > 0 && (
				<div
					className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in"
					onClick={() => setGalleryImages([])}
				>
					<div
						className="relative w-full h-full flex items-center justify-center"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-4 right-4 text-white/80 hover:text-white z-10 bg-black/30 p-2 rounded-full backdrop-blur-sm"
							onClick={() => setGalleryImages([])}
						>
							<X size={24} />
						</button>
						{galleryImages.length > 1 && (
							<>
								<button
									className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 p-3 rounded-full backdrop-blur-sm transition-all z-10"
									onClick={prevImage}
								>
									<ChevronRight size={22} className="rotate-180" />
								</button>
								<button
									className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 p-3 rounded-full backdrop-blur-sm transition-all z-10"
									onClick={nextImage}
								>
									<ChevronRight size={22} />
								</button>
							</>
						)}
						<img
							src={galleryImages[galleryIndex]}
							className="max-w-full max-h-[90vh] object-contain p-4 animate-scale-in"
							alt=""
						/>
						<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full">
							{galleryIndex + 1} / {galleryImages.length}
						</div>
					</div>
				</div>
			)}

			<div className="h-20 sm:hidden" />
		</>
	);
}
