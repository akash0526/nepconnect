"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, getDeviceId, getUserName } from "../../../lib/supabase";
import {
	ArrowLeft,
	Phone,
	MessageCircle,
	MapPin,
	Loader2,
	ShieldCheck,
	Sparkles,
	Trash2,
	ChevronLeft,
	ChevronRight,
	X,
	Expand,
	Grid3X3,
	Clock,
	Tag,
	Share2,
	Star,
	Heart,
	Send,
	User,
	CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import FavoriteButton from "../../../components/ui/FavoriteButton";
import { ReviewForm, ReviewList } from "../../../components/ui/ReviewCard";
import InboxDrawer from "../../../components/ui/InboxDrawer";

const DetailMap = dynamic(() => import("../../../components/DetailMap"), {
	ssr: false,
	loading: () => (
		<div className="h-48 rounded-2xl skeleton flex items-center justify-center">
			<Loader2 className="animate-spin text-gray-400" size={20} />
		</div>
	),
});

export default function ProductDetail() {
	const { id } = useParams();
	const router = useRouter();
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [gridView, setGridView] = useState(false);
	const [reviews, setReviews] = useState([]);
	const [avgRating, setAvgRating] = useState({ avg: 0, count: 0 });
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [showChat, setShowChat] = useState(false);
	const [isOwnListing, setIsOwnListing] = useState(false);
	const [showFullDesc, setShowFullDesc] = useState(false);

	const myId = getDeviceId();
	const myName = getUserName();

	useEffect(() => {
		if (!id) return;
		loadListing();
	}, [id]);

	const loadListing = async () => {
		const { data, error } = await supabase
			.from("listings")
			.select("*")
			.eq("id", id)
			.single();
		if (error) {
			console.error(error);
			router.push("/");
			return;
		}
		setListing(data);
		setIsOwnListing(data.user_id === myId);
		setLoading(false);

		// Load reviews
		loadReviews(data.user_id);
	};

	const loadReviews = async (sellerId) => {
		const { data } = await supabase
			.from("reviews")
			.select("*")
			.eq("seller_id", sellerId)
			.order("created_at", { ascending: false });
		if (data) {
			setReviews(data);
			if (data.length > 0) {
				const sum = data.reduce((a, b) => a + b.rating, 0);
				setAvgRating({ avg: (sum / data.length).toFixed(1), count: data.length });
			}
		}
	};

	const handleReviewSubmit = async (review) => {
		const { data, error } = await supabase
			.from("reviews")
			.insert([{ ...review, reviewer_id: myId, reviewer_name: myName, is_verified_purchase: true }])
			.select()
			.single();
		if (!error && data) {
			setReviews((prev) => [data, ...prev]);
			setShowReviewForm(false);
			// Recalculate average
			const all = [data, ...reviews];
			const sum = all.reduce((a, b) => a + b.rating, 0);
			setAvgRating({ avg: (sum / all.length).toFixed(1), count: all.length });
			// Notify seller
			await supabase.from("notifications").insert([{
				user_id: listing.user_id,
				type: "review",
				title: `New ${data.rating}★ review on your listing`,
				body: data.comment?.substring(0, 100) || "No comment",
				data: { listing_id: listing.id },
				link: `/product/${listing.id}`,
			}]);
		}
	};

	useEffect(() => {
		if (!lightboxOpen) return;
		const onKey = (e) => {
			if (e.key === "ArrowRight") setLightboxIndex((p) => (p + 1) % images.length);
			if (e.key === "ArrowLeft") setLightboxIndex((p) => (p - 1 + images.length) % images.length);
			if (e.key === "Escape") setLightboxOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [lightboxOpen]);

	useEffect(() => {
		document.body.style.overflow = lightboxOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [lightboxOpen]);

	const handleDelete = async () => {
		if (!confirm("Delete this listing?")) return;
		const { error } = await supabase
			.from("listings")
			.delete()
			.eq("id", id)
			.eq("user_id", myId);
		if (!error) router.push("/");
	};

	const handleShare = useCallback(() => {
		if (navigator.share) {
			navigator.share({
				title: listing?.title,
				text: `Check out "${listing?.title}" on NepConnect!`,
				url: window.location.href,
			}).catch(() => {});
		}
	}, [listing]);

	if (loading) return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<Loader2 className="animate-spin text-[var(--color-primary)]" size={36} />
				<p className="text-sm text-gray-500">Loading listing...</p>
			</div>
		</div>
	);
	if (!listing) return null;

	const images = listing.image_urls?.length
		? listing.image_urls
		: listing.image_url ? [listing.image_url] : [];

	const timeAgo = (d) => {
		const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days} days ago`;
		return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const descTruncated = listing.description?.length > 150;

	return (
		<div className="-mx-4 bg-[var(--color-bg)] min-h-screen pb-32">
			{/* ── Sticky Header ── */}
			<div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
				<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 transition">
							<ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
						</button>
						<span className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 max-w-[180px]">{listing.title}</span>
					</div>
					<div className="flex items-center gap-2">
						<button onClick={handleShare} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 transition">
							<Share2 size={16} className="text-gray-600 dark:text-gray-300" />
						</button>
						{isOwnListing && (
							<button onClick={handleDelete} className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-100 transition">
								<Trash2 size={16} className="text-red-500" />
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="max-w-2xl mx-auto">
				{/* ── Images ── */}
				{images.length > 0 ? (
					<div className="bg-black relative">
						<div className="relative aspect-[4/3] overflow-hidden">
							<img key={currentIndex} src={images[currentIndex]} alt={listing.title}
								className="w-full h-full object-contain animate-scale-in cursor-zoom-in"
								onClick={() => { setLightboxIndex(currentIndex); setLightboxOpen(true); }} />
							<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

							{/* Badges */}
							<div className="absolute top-4 left-4 flex gap-2">
								{listing.is_verified && (
									<div className="bg-blue-600 text-white rounded-full px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
										<ShieldCheck size={12} /> Verified
									</div>
								)}
								{listing.ai_condition_report && (
									<div className="bg-white/90 dark:bg-slate-800/90 text-gray-800 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur-sm">
										{listing.ai_condition_report}
									</div>
								)}
							</div>

							{/* Favorite Button */}
							<div className="absolute top-4 right-4">
								<FavoriteButton listingId={listing.id} size={18} />
							</div>

							{images.length > 1 && (
								<>
									<button onClick={() => setCurrentIndex((p) => (p - 1 + images.length) % images.length)}
										className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition border border-white/20">
										<ChevronLeft size={22} className="text-white" />
									</button>
									<button onClick={() => setCurrentIndex((p) => (p + 1) % images.length)}
										className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition border border-white/20">
										<ChevronRight size={22} className="text-white" />
									</button>
								</>
							)}

							{images.length > 1 && (
								<div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
									{images.map((_, i) => (
										<button key={i} onClick={() => setCurrentIndex(i)}
											className={`transition-all duration-200 ${i === currentIndex ? "w-6 h-2 bg-white rounded-full" : "w-2 h-2 bg-white/50 rounded-full hover:bg-white/80"}`} />
									))}
								</div>
							)}
						</div>

						{images.length > 1 && (
							<div className="flex gap-2 px-4 py-3 bg-black overflow-x-auto hide-scrollbar">
								{images.map((img, i) => (
									<button key={i} onClick={() => setCurrentIndex(i)}
										className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all ${i === currentIndex ? "ring-2 ring-[var(--color-primary)] opacity-100" : "opacity-50 hover:opacity-75"}`}>
										<img src={img} alt="" className="w-full h-full object-cover" />
									</button>
								))}
							</div>
						)}
					</div>
				) : (
					<div className="aspect-[4/3] bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 text-sm">No images available</div>
				)}

				{/* ── Content ── */}
				<div className="px-4 py-5 space-y-4">
					{/* Title / Price / Rating */}
					<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
						<h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-1">{listing.title}</h1>
						<p className="text-3xl font-black text-[var(--color-primary)] mb-3">NPR {Number(listing.price).toLocaleString()}</p>
						<div className="flex flex-wrap gap-2 mb-3">
							{listing.category && (
								<span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs font-semibold">
									<Tag size={11} /> {listing.category}
								</span>
							)}
							{listing.created_at && (
								<span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs font-semibold">
									<Clock size={11} /> {timeAgo(listing.created_at)}
								</span>
							)}
						</div>

						{/* Rating */}
						{avgRating.count > 0 && (
							<div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
								<div className="flex items-center gap-0.5">
									{[1, 2, 3, 4, 5].map((s) => (
										<Star key={s} size={14}
											className={s <= Math.round(avgRating.avg) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
									))}
								</div>
								<span className="text-sm font-bold text-gray-700 dark:text-gray-300">{avgRating.avg}</span>
								<span className="text-xs text-gray-400">({avgRating.count} reviews)</span>
							</div>
						)}
					</div>

					{/* Description */}
					{listing.description && (
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
							<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
								{showFullDesc || !descTruncated ? listing.description : listing.description.substring(0, 150) + "..."}
							</p>
							{descTruncated && (
								<button onClick={() => setShowFullDesc(!showFullDesc)}
									className="text-xs font-bold text-[var(--color-primary)] mt-2 hover:underline">
									{showFullDesc ? "Show less" : "Read more"}
								</button>
							)}
						</div>
					)}

					{/* AI Analysis */}
					{listing.ai_detected_item && (
						<div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
							<div className="flex items-center gap-2 mb-2">
								<Sparkles size={14} className="text-blue-600" />
								<span className="font-bold text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wider">AI Detected</span>
							</div>
							<p className="text-sm text-gray-700 dark:text-gray-300">{listing.ai_detected_item}</p>
						</div>
					)}

					{/* Location */}
					{(listing.manual_address || (listing.latitude && listing.longitude)) && (
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
							<div className="flex items-center gap-2 mb-3">
								<MapPin size={14} className="text-[var(--color-primary)]" />
								<span className="font-bold text-sm text-gray-900 dark:text-gray-100">Location</span>
							</div>
							{listing.manual_address && (
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-2.5">📍 {listing.manual_address}</p>
							)}
							{listing.latitude && listing.longitude && (
								<div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600 h-48">
									<DetailMap latitude={listing.latitude} longitude={listing.longitude} />
								</div>
							)}
						</div>
					)}

					{/* Seller Card with Rating */}
					{listing.phone && (
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center font-black text-lg text-[var(--color-primary)]">
										{listing.phone?.slice(-2)}
									</div>
									<div>
										<p className="font-bold text-sm text-gray-900 dark:text-gray-100">Seller</p>
										<p className="text-sm text-gray-500">{listing.phone}</p>
										{avgRating.count > 0 && (
											<div className="flex items-center gap-1 mt-0.5">
												{[1, 2, 3, 4, 5].map((s) => (
													<Star key={s} size={10}
														className={s <= Math.round(avgRating.avg) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
												))}
												<span className="text-[10px] text-gray-400 ml-1">({avgRating.count})</span>
											</div>
										)}
									</div>
								</div>
								<span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full">Active</span>
							</div>
						</div>
					)}

					{/* Reviews Section */}
					{reviews.length > 0 && (
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
							<h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
								<Star size={16} className="text-amber-400" />
								Reviews ({reviews.length})
							</h3>
							<ReviewList reviews={reviews} avg={avgRating.avg} count={avgRating.count} />
						</div>
					)}

					{/* Review Form (only for buyers, not the owner) */}
					{!isOwnListing && (
						<button onClick={() => setShowReviewForm(!showReviewForm)}
							className="w-full py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2 hover:bg-amber-100 transition active:scale-[0.98]">
							<Star size={16} />
							{showReviewForm ? "Cancel" : "Rate this Seller"}
						</button>
					)}
					{showReviewForm && (
						<div className="animate-slide-up">
							<ReviewForm listingId={listing.id} sellerId={listing.user_id} onSubmit={handleReviewSubmit} />
						</div>
					)}

					{/* In-App Chat (buyers only) */}
					{!isOwnListing && listing.phone && (
						<button onClick={() => setShowChat(!showChat)}
							className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 hover:bg-blue-100 transition active:scale-[0.98]">
							<MessageCircle size={16} />
							{showChat ? "Close Chat" : "Send a Message"}
						</button>
					)}
					{showChat && (
						<div className="animate-slide-up">
							<InboxDrawer listing={listing} sellerId={listing.user_id} onClose={() => setShowChat(false)} />
						</div>
					)}
				</div>
			</div>

			{/* ── Fixed Contact Bar ── */}
			{listing.phone && (
				<div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom,0px)]">
					<div className="max-w-2xl mx-auto px-4 py-3 flex gap-3">
						<a href={`tel:${listing.phone}`}
							className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl active:scale-[0.98] transition-all">
							<Phone size={18} /> Call
						</a>
						<a href={`https://wa.me/977${listing.phone?.replace(/\s/g, "")}?text=${encodeURIComponent(`Namaste! I'm interested in your "${listing.title}" listed on NepConnect.`)}`}
							target="_blank" rel="noreferrer"
							className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-green-900/30 hover:shadow-xl active:scale-[0.98] transition-all">
							<MessageCircle size={18} /> WhatsApp
						</a>
						{!isOwnListing && (
							<button onClick={() => setShowChat(!showChat)}
								className="bg-blue-500 text-white rounded-2xl py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl active:scale-[0.98] transition-all">
								<MessageCircle size={18} />
							</button>
						)}
					</div>
				</div>
			)}

			{/* Grid/Lightbox modals stay the same... */}
			{gridView && (
				<div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in" onClick={() => setGridView(false)}>
					<div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
						<span className="text-white font-bold text-sm">All Photos ({images.length})</span>
						<button onClick={() => setGridView(false)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"><X size={18} className="text-white" /></button>
					</div>
					<div className="flex-1 overflow-y-auto px-4 pb-8" onClick={(e) => e.stopPropagation()}>
						<div className="grid grid-cols-2 gap-2">
							{images.map((img, i) => (
								<button key={i} onClick={() => { setLightboxIndex(i); setGridView(false); setLightboxOpen(true); }}
									className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition">
									<img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{lightboxOpen && (
				<div className="fixed inset-0 z-[60] bg-black flex flex-col">
					<div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/70 to-transparent">
						<button onClick={() => { setLightboxOpen(false); setGridView(true); }}
							className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20"><Grid3X3 size={15} className="text-white" /></button>
						<span className="text-white/80 text-sm font-bold">{lightboxIndex + 1} / {images.length}</span>
						<button onClick={() => setLightboxOpen(false)}
							className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20"><X size={18} className="text-white" /></button>
					</div>
					<div className="flex-1 flex items-center justify-center relative">
						<img key={lightboxIndex} src={images[lightboxIndex]} alt={listing.title}
							className="max-w-full max-h-full object-contain p-4 animate-scale-in" />
						{images.length > 1 && (
							<>
								<button onClick={() => setLightboxIndex((p) => (p - 1 + images.length) % images.length)}
									className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition border border-white/20"><ChevronLeft size={26} className="text-white" /></button>
								<button onClick={() => setLightboxIndex((p) => (p + 1) % images.length)}
									className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition border border-white/20"><ChevronRight size={26} className="text-white" /></button>
							</>
						)}
					</div>
					{images.length > 1 && (
						<div className="flex-shrink-0 flex gap-2 px-4 py-4 justify-center overflow-x-auto bg-gradient-to-t from-black/80 to-transparent">
							{images.map((img, i) => (
								<button key={i} onClick={() => setLightboxIndex(i)}
									className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all ${i === lightboxIndex ? "ring-2 ring-[var(--color-primary)] opacity-100" : "opacity-40 hover:opacity-70"}`}>
									<img src={img} alt="" className="w-full h-full object-cover" />
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}