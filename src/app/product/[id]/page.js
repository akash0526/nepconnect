"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, getDeviceId } from "../../../lib/supabase";
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
} from "lucide-react";
import dynamic from "next/dynamic";

const DetailMap = dynamic(() => import("../../../components/DetailMap"), {
	ssr: false,
	loading: () => (
		<div className="h-48 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
			Loading Map...
		</div>
	),
});

export default function ProductDetail() {
	const { id } = useParams();
	const router = useRouter();
	const [listing, setListing] = useState(null);
	const [loading, setLoading] = useState(true);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const myId = getDeviceId();

	useEffect(() => {
		const fetchListing = async () => {
			const { data, error } = await supabase
				.from("listings")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				console.error(error);
				router.push("/");
			} else {
				setListing(data);
			}
			setLoading(false);
		};
		fetchListing();
	}, [id]);

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this listing?")) {
			const { error } = await supabase
				.from("listings")
				.delete()
				.eq("id", id)
				.eq("user_id", myId);

			if (!error) {
				router.push("/");
			} else {
				alert("Failed to delete listing.");
			}
		}
	};

	const nextImage = () => {
		if (listing?.image_urls) {
			setCurrentImageIndex((prev) => (prev + 1) % listing.image_urls.length);
		}
	};

	const prevImage = () => {
		if (listing?.image_urls) {
			setCurrentImageIndex(
				(prev) =>
					(prev - 1 + listing.image_urls.length) % listing.image_urls.length,
			);
		}
	};

	const getConditionColor = (condition) => {
		const map = {
			New: "bg-green-600",
			"Like New": "bg-green-500",
			Good: "bg-yellow-500",
			Fair: "bg-orange-500",
			"For Parts": "bg-red-500",
		};
		return map[condition] || "bg-gray-400";
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="animate-spin text-green-600" size={40} />
			</div>
		);
	}

	if (!listing) return null;

	const images = listing.image_urls?.length
		? listing.image_urls
		: listing.image_url
			? [listing.image_url]
			: [];

	return (
		<div className="min-h-screen bg-white pb-24">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center">
				<button
					onClick={() => router.back()}
					className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition"
				>
					<ArrowLeft size={24} />
				</button>
				<h1 className="flex-1 text-center font-bold text-gray-900">Details</h1>
				{listing.user_id === myId && (
					<button
						onClick={handleDelete}
						className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
					>
						<Trash2 size={20} />
					</button>
				)}
			</div>

			{/* Image Carousel */}
			<div className="relative bg-gray-100">
				{images.length > 0 ? (
					<>
						<img
							src={images[currentImageIndex]}
							className="w-full h-80 object-cover"
							alt={listing.title}
						/>
						{images.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
								>
									<ChevronLeft size={24} />
								</button>
								<button
									onClick={nextImage}
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
								>
									<ChevronRight size={24} />
								</button>
								<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
									{images.map((_, idx) => (
										<div
											key={idx}
											className={`h-1.5 rounded-full transition-all ${
												idx === currentImageIndex
													? "w-6 bg-white"
													: "w-1.5 bg-white/60"
											}`}
										/>
									))}
								</div>
							</>
						)}
						{listing.is_verified && (
							<div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
								<ShieldCheck size={14} /> AI VERIFIED
							</div>
						)}
					</>
				) : (
					<div className="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-400">
						No image
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4 space-y-6">
				{/* Title & Price */}
				<div>
					<div className="flex items-start justify-between">
						<h2 className="text-2xl font-bold text-gray-900">
							{listing.title}
						</h2>
						{listing.ai_condition_report && (
							<span
								className={`text-xs font-bold px-3 py-1.5 rounded-full text-white ${getConditionColor(
									listing.ai_condition_report,
								)}`}
							>
								{listing.ai_condition_report}
							</span>
						)}
					</div>
					<p className="text-3xl font-black text-green-600 mt-1">
						NPR {listing.price}
					</p>
					<p className="text-sm text-gray-500 mt-1">
						Category: {listing.category}
					</p>
				</div>

				{/* AI Analysis Card */}
				{(listing.ai_detected_item || listing.description) && (
					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
						<div className="flex items-center gap-2 mb-2">
							<Sparkles size={18} className="text-blue-600" />
							<span className="font-bold text-blue-800 text-sm">
								AI ANALYSIS
							</span>
						</div>
						{listing.ai_detected_item && (
							<p className="text-sm text-gray-700 mb-2">
								<span className="font-medium">Detected:</span>{" "}
								{listing.ai_detected_item}
							</p>
						)}
						{listing.description && (
							<p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
								{listing.description}
							</p>
						)}
					</div>
				)}

				{/* Location */}
				<div>
					<div className="flex items-center gap-2 mb-2">
						<MapPin size={18} className="text-green-600" />
						<h3 className="font-bold text-gray-800">Location</h3>
					</div>
					{listing.manual_address && (
						<p className="text-sm text-gray-600 mb-2 bg-gray-50 p-3 rounded-xl">
							📝 {listing.manual_address}
						</p>
					)}
					{listing.latitude && listing.longitude && (
						<div className="h-48 rounded-2xl overflow-hidden border border-gray-200">
							<DetailMap
								latitude={listing.latitude}
								longitude={listing.longitude}
							/>
						</div>
					)}
				</div>

				{/* Contact Actions */}
				<div className="flex gap-3 pt-4">
					<a
						href={`tel:${listing.phone}`}
						className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
					>
						<Phone size={20} /> Call
					</a>
					<a
						href={`https://wa.me/977${listing.phone?.replace(/\s/g, "")}?text=Namaste! I'm interested in your "${listing.title}" listed on NepConnect.`}
						className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
					>
						<MessageCircle size={20} /> WhatsApp
					</a>
				</div>
			</div>
		</div>
	);
}
