"use client";
import { useEffect, useState, useCallback } from "react";
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
	X,
	Expand,
	Grid3X3,
} from "lucide-react";
import dynamic from "next/dynamic";

const DetailMap = dynamic(() => import("../../../components/DetailMap"), {
	ssr: false,
	loading: () => (
		<div className="h-48 bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-gray-400">
			Loading map…
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
	const myId = getDeviceId();

	useEffect(() => {
		supabase
			.from("listings")
			.select("*")
			.eq("id", id)
			.single()
			.then(({ data, error }) => {
				if (error) {
					console.error(error);
					router.push("/");
				} else setListing(data);
				setLoading(false);
			});
	}, [id]);

	// Keyboard nav
	useEffect(() => {
		if (!lightboxOpen) return;
		const onKey = (e) => {
			if (e.key === "ArrowRight")
				setLightboxIndex((p) => (p + 1) % images.length);
			if (e.key === "ArrowLeft")
				setLightboxIndex((p) => (p - 1 + images.length) % images.length);
			if (e.key === "Escape") setLightboxOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [lightboxOpen]);

	// Prevent body scroll
	useEffect(() => {
		document.body.style.overflow = lightboxOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [lightboxOpen]);

	const handleDelete = async () => {
		if (!confirm("Delete this listing?")) return;
		const { error } = await supabase
			.from("listings")
			.delete()
			.eq("id", id)
			.eq("user_id", myId);
		if (!error) router.push("/");
		else alert("Failed to delete.");
	};

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<Loader2 className="animate-spin text-green-600" size={40} />
			</div>
		);
	if (!listing) return null;

	const images = listing.image_urls?.length
		? listing.image_urls
		: listing.image_url
			? [listing.image_url]
			: [];

	const conditionMeta = {
		New: { cls: "bg-emerald-500", dot: "#10b981" },
		"Like New": { cls: "bg-green-500", dot: "#22c55e" },
		Good: { cls: "bg-yellow-500", dot: "#eab308" },
		Fair: { cls: "bg-orange-500", dot: "#f97316" },
		"For Parts": { cls: "bg-red-500", dot: "#ef4444" },
	};
	const cond = conditionMeta[listing.ai_condition_report] || {
		cls: "bg-gray-400",
		dot: "#9ca3af",
	};

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
				.pd { font-family: 'Outfit', sans-serif; }
				@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
				@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
				@keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
				.fade-in  { animation: fadeIn  0.4s ease both; }
				.slide-up { animation: slideUp 0.45s ease both; }
				.scale-in { animation: scaleIn 0.35s cubic-bezier(.22,1,.36,1) both; }
				.img-thumb { cursor: zoom-in; transition: transform 0.2s, opacity 0.2s; }
				.img-thumb:hover { transform: scale(1.03); opacity: 0.92; }
				.lb-prev, .lb-next { transition: background 0.15s, transform 0.15s; }
				.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.2) !important; transform: scale(1.08); }
				.contact-btn { transition: transform 0.15s, box-shadow 0.15s; }
				.contact-btn:hover { transform: translateY(-2px); }
				.contact-btn:active { transform: scale(0.97); }
				.grid-thumb { cursor: zoom-in; overflow:hidden; border-radius:12px; aspect-ratio:1; transition: transform 0.2s; }
				.grid-thumb:hover { transform: scale(1.04); }
				.grid-thumb img { width:100%; height:100%; object-fit:cover; display:block; transition: transform 0.3s; }
				.grid-thumb:hover img { transform: scale(1.06); }
				.pill-tag { background: rgba(0,0,0,0.06); border-radius:100px; padding: 4px 12px; font-size:12px; font-weight:600; color:#374151; display:inline-flex; align-items:center; gap:5px; }
			`}</style>

			<div className="pd min-h-screen bg-[#f9f9f7] pb-32">
				{/* ── Sticky Header ── */}
				<div
					style={{
						position: "sticky",
						top: 0,
						zIndex: 30,
						background: "rgba(249,249,247,0.85)",
						backdropFilter: "blur(16px)",
						WebkitBackdropFilter: "blur(16px)",
						borderBottom: "1px solid rgba(0,0,0,0.06)",
						padding: "12px 16px",
						display: "flex",
						alignItems: "center",
						gap: 12,
						maxWidth: 600,
						margin: "0 auto",
					}}
				>
					<button
						onClick={() => router.back()}
						style={{
							width: 38,
							height: 38,
							borderRadius: "50%",
							background: "#fff",
							border: "1px solid rgba(0,0,0,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							flexShrink: 0,
							boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
						}}
					>
						<ArrowLeft size={18} color="#374151" />
					</button>
					<span
						style={{
							flex: 1,
							fontWeight: 700,
							fontSize: 16,
							color: "#111",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{listing.title}
					</span>
					{listing.user_id === myId && (
						<button
							onClick={handleDelete}
							style={{
								width: 38,
								height: 38,
								borderRadius: "50%",
								background: "#fff0f0",
								border: "1px solid #fecaca",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								flexShrink: 0,
							}}
						>
							<Trash2 size={16} color="#ef4444" />
						</button>
					)}
				</div>

				<div style={{ maxWidth: 600, margin: "0 auto" }}>
					{/* ── Hero Image ── */}
					{images.length > 0 ? (
						<div
							className="fade-in"
							style={{
								position: "relative",
								background: "#111",
								overflow: "hidden",
							}}
						>
							{/* Main image */}
							<div
								style={{
									position: "relative",
									aspectRatio: "4/3",
									overflow: "hidden",
								}}
							>
								<img
									key={currentIndex}
									src={images[currentIndex]}
									alt={listing.title}
									className="scale-in"
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										display: "block",
										cursor: "zoom-in",
									}}
									onClick={() => {
										setLightboxIndex(currentIndex);
										setLightboxOpen(true);
									}}
								/>
								{/* Gradient overlay bottom */}
								<div
									style={{
										position: "absolute",
										bottom: 0,
										left: 0,
										right: 0,
										height: 100,
										background:
											"linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
										pointerEvents: "none",
									}}
								/>

								{/* Badges */}
								<div
									style={{
										position: "absolute",
										top: 14,
										left: 14,
										display: "flex",
										gap: 7,
									}}
								>
									{listing.is_verified && (
										<div
											style={{
												background: "#2563eb",
												color: "#fff",
												borderRadius: 30,
												padding: "5px 11px",
												fontSize: 11,
												fontWeight: 800,
												display: "flex",
												alignItems: "center",
												gap: 5,
												boxShadow: "0 2px 10px rgba(37,99,235,0.4)",
											}}
										>
											<ShieldCheck size={12} /> AI VERIFIED
										</div>
									)}
									{listing.ai_condition_report && (
										<div
											style={{
												background: cond.dot,
												color: "#fff",
												borderRadius: 30,
												padding: "5px 11px",
												fontSize: 11,
												fontWeight: 800,
												boxShadow: `0 2px 10px ${cond.dot}66`,
											}}
										>
											{listing.ai_condition_report}
										</div>
									)}
								</div>

								{/* Expand + Grid buttons */}
								<div
									style={{
										position: "absolute",
										top: 14,
										right: 14,
										display: "flex",
										gap: 7,
									}}
								>
									{images.length > 1 && (
										<button
											onClick={() => setGridView(true)}
											style={{
												width: 34,
												height: 34,
												borderRadius: "50%",
												background: "rgba(0,0,0,0.4)",
												border: "1px solid rgba(255,255,255,0.2)",
												backdropFilter: "blur(8px)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
											}}
										>
											<Grid3X3 size={15} color="white" />
										</button>
									)}
									<button
										onClick={() => {
											setLightboxIndex(currentIndex);
											setLightboxOpen(true);
										}}
										style={{
											width: 34,
											height: 34,
											borderRadius: "50%",
											background: "rgba(0,0,0,0.4)",
											border: "1px solid rgba(255,255,255,0.2)",
											backdropFilter: "blur(8px)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											cursor: "pointer",
										}}
									>
										<Expand size={15} color="white" />
									</button>
								</div>

								{/* Carousel arrows */}
								{images.length > 1 && (
									<>
										<button
											onClick={() =>
												setCurrentIndex(
													(p) => (p - 1 + images.length) % images.length,
												)
											}
											style={{
												position: "absolute",
												left: 10,
												top: "50%",
												transform: "translateY(-50%)",
												width: 40,
												height: 40,
												borderRadius: "50%",
												background: "rgba(0,0,0,0.35)",
												border: "1px solid rgba(255,255,255,0.15)",
												backdropFilter: "blur(8px)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
											}}
											className="lb-prev"
										>
											<ChevronLeft size={22} color="white" />
										</button>
										<button
											onClick={() =>
												setCurrentIndex((p) => (p + 1) % images.length)
											}
											style={{
												position: "absolute",
												right: 10,
												top: "50%",
												transform: "translateY(-50%)",
												width: 40,
												height: 40,
												borderRadius: "50%",
												background: "rgba(0,0,0,0.35)",
												border: "1px solid rgba(255,255,255,0.15)",
												backdropFilter: "blur(8px)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
											}}
											className="lb-next"
										>
											<ChevronRight size={22} color="white" />
										</button>
									</>
								)}

								{/* Dot indicators */}
								{images.length > 1 && (
									<div
										style={{
											position: "absolute",
											bottom: 14,
											left: 0,
											right: 0,
											display: "flex",
											justifyContent: "center",
											gap: 5,
										}}
									>
										{images.map((_, i) => (
											<button
												key={i}
												onClick={() => setCurrentIndex(i)}
												style={{
													width: i === currentIndex ? 22 : 7,
													height: 7,
													borderRadius: 10,
													background:
														i === currentIndex
															? "#fff"
															: "rgba(255,255,255,0.45)",
													border: "none",
													cursor: "pointer",
													transition: "all 0.25s",
													padding: 0,
												}}
											/>
										))}
									</div>
								)}

								{/* Image counter */}
								{images.length > 1 && (
									<div
										style={{
											position: "absolute",
											bottom: 14,
											right: 14,
											background: "rgba(0,0,0,0.5)",
											color: "#fff",
											borderRadius: 20,
											padding: "3px 10px",
											fontSize: 12,
											fontWeight: 700,
										}}
									>
										{currentIndex + 1}/{images.length}
									</div>
								)}
							</div>

							{/* Thumbnail strip */}
							{images.length > 1 && (
								<div
									style={{
										display: "flex",
										gap: 6,
										padding: "10px 14px",
										background: "#111",
										overflowX: "auto",
									}}
								>
									{images.map((img, i) => (
										<div
											key={i}
											className="img-thumb"
											onClick={() => setCurrentIndex(i)}
											style={{
												flexShrink: 0,
												width: 58,
												height: 58,
												borderRadius: 10,
												overflow: "hidden",
												border:
													i === currentIndex
														? "2.5px solid #22c55e"
														: "2.5px solid transparent",
												opacity: i === currentIndex ? 1 : 0.55,
											}}
										>
											<img
												src={img}
												alt=""
												style={{
													width: "100%",
													height: "100%",
													objectFit: "cover",
													display: "block",
												}}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<div
							style={{
								aspectRatio: "4/3",
								background: "#f3f4f6",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#d1d5db",
								fontSize: 14,
							}}
						>
							No images available
						</div>
					)}

					{/* ── Content ── */}
					<div
						style={{
							padding: "20px 16px",
							display: "flex",
							flexDirection: "column",
							gap: 20,
						}}
					>
						{/* Title / Price / Tags */}
						<div
							className="slide-up"
							style={{
								background: "#fff",
								borderRadius: 20,
								padding: "18px 18px",
								border: "1px solid rgba(0,0,0,0.06)",
								boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
							}}
						>
							<h1
								style={{
									fontSize: 22,
									fontWeight: 800,
									color: "#111",
									margin: "0 0 6px",
									lineHeight: 1.25,
								}}
							>
								{listing.title}
							</h1>
							<p
								style={{
									fontSize: 30,
									fontWeight: 900,
									color: "#16a34a",
									margin: "0 0 14px",
									letterSpacing: -0.5,
								}}
							>
								NPR {Number(listing.price).toLocaleString()}
							</p>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
								{listing.category && (
									<span className="pill-tag">🏷 {listing.category}</span>
								)}
								{listing.manual_address && (
									<span className="pill-tag">
										<MapPin size={11} /> {listing.manual_address}
									</span>
								)}
							</div>
						</div>

						{/* AI Analysis */}
						{(listing.ai_detected_item || listing.description) && (
							<div
								className="slide-up"
								style={{
									animationDelay: "0.06s",
									background: "linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)",
									borderRadius: 20,
									padding: "16px 18px",
									border: "1px solid #bfdbfe",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										marginBottom: 10,
									}}
								>
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: 8,
											background: "#2563eb",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Sparkles size={14} color="white" />
									</div>
									<span
										style={{
											fontWeight: 800,
											fontSize: 13,
											color: "#1e40af",
											letterSpacing: 0.5,
											textTransform: "uppercase",
										}}
									>
										AI Analysis
									</span>
								</div>
								{listing.ai_detected_item && (
									<p
										style={{
											fontSize: 13,
											color: "#374151",
											margin: "0 0 8px",
											display: "flex",
											gap: 6,
											alignItems: "flex-start",
										}}
									>
										<span
											style={{
												fontWeight: 700,
												color: "#1d4ed8",
												flexShrink: 0,
											}}
										>
											Detected:
										</span>
										{listing.ai_detected_item}
									</p>
								)}
								{listing.description && (
									<p
										style={{
											fontSize: 13.5,
											color: "#374151",
											margin: 0,
											lineHeight: 1.7,
											whiteSpace: "pre-wrap",
										}}
									>
										{listing.description}
									</p>
								)}
							</div>
						)}

						{/* Location */}
						{(listing.manual_address ||
							(listing.latitude && listing.longitude)) && (
							<div
								className="slide-up"
								style={{
									animationDelay: "0.1s",
									background: "#fff",
									borderRadius: 20,
									padding: "16px 18px",
									border: "1px solid rgba(0,0,0,0.06)",
									boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										marginBottom: 12,
									}}
								>
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: 8,
											background: "#dcfce7",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<MapPin size={14} color="#16a34a" />
									</div>
									<span
										style={{ fontWeight: 700, fontSize: 14, color: "#111" }}
									>
										Location
									</span>
								</div>
								{listing.manual_address && (
									<p
										style={{
											fontSize: 13,
											color: "#6b7280",
											margin: "0 0 12px",
											background: "#f9fafb",
											padding: "10px 14px",
											borderRadius: 12,
											border: "1px solid #f3f4f6",
										}}
									>
										📍 {listing.manual_address}
									</p>
								)}
								{listing.latitude && listing.longitude && (
									<div
										style={{
											borderRadius: 16,
											overflow: "hidden",
											border: "1px solid #e5e7eb",
											height: 200,
										}}
									>
										<DetailMap
											latitude={listing.latitude}
											longitude={listing.longitude}
										/>
									</div>
								)}
							</div>
						)}

						{/* Seller / Phone */}
						{listing.phone && (
							<div
								className="slide-up"
								style={{
									animationDelay: "0.13s",
									background: "#fff",
									borderRadius: 20,
									padding: "14px 18px",
									border: "1px solid rgba(0,0,0,0.06)",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
									<div
										style={{
											width: 40,
											height: 40,
											borderRadius: "50%",
											background: "#f0fdf4",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontWeight: 800,
											fontSize: 16,
											color: "#16a34a",
										}}
									>
										{listing.phone?.slice(-2)}
									</div>
									<div>
										<p
											style={{
												margin: 0,
												fontWeight: 700,
												fontSize: 14,
												color: "#111",
											}}
										>
											Seller
										</p>
										<p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
											{listing.phone}
										</p>
									</div>
								</div>
								<span
									style={{
										fontSize: 12,
										fontWeight: 600,
										color: "#16a34a",
										background: "#f0fdf4",
										padding: "4px 12px",
										borderRadius: 20,
										border: "1px solid #bbf7d0",
									}}
								>
									Active
								</span>
							</div>
						)}
					</div>
				</div>

				{/* ── Fixed Contact Bar ── */}
				<div
					style={{
						position: "fixed",
						bottom: 0,
						left: 0,
						right: 0,
						padding: "14px 16px 20px",
						background: "rgba(249,249,247,0.92)",
						backdropFilter: "blur(20px)",
						WebkitBackdropFilter: "blur(20px)",
						borderTop: "1px solid rgba(0,0,0,0.07)",
						zIndex: 40,
					}}
				>
					<div
						style={{
							maxWidth: 600,
							margin: "0 auto",
							display: "flex",
							gap: 10,
						}}
					>
						<a
							href={`tel:${listing.phone}`}
							className="contact-btn"
							style={{
								flex: 1,
								background: "#1d4ed8",
								color: "#fff",
								borderRadius: 16,
								padding: "15px 0",
								fontWeight: 800,
								fontSize: 15,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 8,
								textDecoration: "none",
								boxShadow: "0 4px 20px rgba(29,78,216,0.35)",
							}}
						>
							<Phone size={18} /> Call
						</a>
						<a
							href={`https://wa.me/977${listing.phone?.replace(/\s/g, "")}?text=${encodeURIComponent(`Namaste! I'm interested in your "${listing.title}" listed on NepConnect.`)}`}
							target="_blank"
							rel="noreferrer"
							className="contact-btn"
							style={{
								flex: 1,
								background: "#16a34a",
								color: "#fff",
								borderRadius: 16,
								padding: "15px 0",
								fontWeight: 800,
								fontSize: 15,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 8,
								textDecoration: "none",
								boxShadow: "0 4px 20px rgba(22,163,74,0.35)",
							}}
						>
							<MessageCircle size={18} /> WhatsApp
						</a>
					</div>
				</div>
			</div>

			{/* ── Grid View Modal ── */}
			{gridView && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 60,
						background: "rgba(0,0,0,0.95)",
						display: "flex",
						flexDirection: "column",
					}}
					onClick={() => setGridView(false)}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "16px 20px",
							flexShrink: 0,
						}}
					>
						<span
							style={{
								color: "#fff",
								fontWeight: 700,
								fontSize: 16,
								fontFamily: "'Outfit',sans-serif",
							}}
						>
							All Photos ({images.length})
						</span>
						<button
							style={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								background: "rgba(255,255,255,0.15)",
								border: "none",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
							onClick={() => setGridView(false)}
						>
							<X size={18} color="white" />
						</button>
					</div>
					<div
						style={{ flex: 1, overflowY: "auto", padding: "0 16px 32px" }}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(2, 1fr)",
								gap: 8,
							}}
						>
							{images.map((img, i) => (
								<div
									key={i}
									className="grid-thumb"
									onClick={() => {
										setLightboxIndex(i);
										setGridView(false);
										setLightboxOpen(true);
									}}
								>
									<img src={img} alt={`Photo ${i + 1}`} loading="lazy" />
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* ── Fullscreen Lightbox ── */}
			{lightboxOpen && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 70,
						background: "#000",
						display: "flex",
						flexDirection: "column",
					}}
				>
					{/* Top bar */}
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "16px 16px",
							zIndex: 10,
							background:
								"linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
						}}
					>
						<button
							onClick={() => {
								setLightboxOpen(false);
								setGridView(true);
							}}
							style={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								background: "rgba(255,255,255,0.15)",
								border: "1px solid rgba(255,255,255,0.15)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
						>
							<Grid3X3 size={15} color="white" />
						</button>
						<span
							style={{
								color: "rgba(255,255,255,0.8)",
								fontWeight: 700,
								fontSize: 14,
								fontFamily: "'Outfit',sans-serif",
							}}
						>
							{lightboxIndex + 1} / {images.length}
						</span>
						<button
							onClick={() => setLightboxOpen(false)}
							style={{
								width: 36,
								height: 36,
								borderRadius: "50%",
								background: "rgba(255,255,255,0.15)",
								border: "1px solid rgba(255,255,255,0.15)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
						>
							<X size={18} color="white" />
						</button>
					</div>

					{/* Image area */}
					<div
						style={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							position: "relative",
							overflow: "hidden",
						}}
					>
						<img
							key={lightboxIndex}
							src={images[lightboxIndex]}
							alt={listing.title}
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
								objectFit: "contain",
								userSelect: "none",
								animation: "scaleIn 0.2s ease",
							}}
						/>

						{images.length > 1 && (
							<>
								<button
									onClick={() =>
										setLightboxIndex(
											(p) => (p - 1 + images.length) % images.length,
										)
									}
									className="lb-prev"
									style={{
										position: "absolute",
										left: 12,
										width: 44,
										height: 44,
										borderRadius: "50%",
										background: "rgba(255,255,255,0.12)",
										border: "1px solid rgba(255,255,255,0.15)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
									}}
								>
									<ChevronLeft size={26} color="white" />
								</button>
								<button
									onClick={() =>
										setLightboxIndex((p) => (p + 1) % images.length)
									}
									className="lb-next"
									style={{
										position: "absolute",
										right: 12,
										width: 44,
										height: 44,
										borderRadius: "50%",
										background: "rgba(255,255,255,0.12)",
										border: "1px solid rgba(255,255,255,0.15)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										cursor: "pointer",
									}}
								>
									<ChevronRight size={26} color="white" />
								</button>
							</>
						)}
					</div>

					{/* Thumbnail filmstrip */}
					{images.length > 1 && (
						<div
							style={{
								flexShrink: 0,
								display: "flex",
								gap: 6,
								padding: "12px 16px 28px",
								overflowX: "auto",
								background:
									"linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
								justifyContent: images.length < 5 ? "center" : "flex-start",
							}}
						>
							{images.map((img, i) => (
								<div
									key={i}
									onClick={() => setLightboxIndex(i)}
									style={{
										flexShrink: 0,
										width: 54,
										height: 54,
										borderRadius: 10,
										overflow: "hidden",
										border:
											i === lightboxIndex
												? "2.5px solid #22c55e"
												: "2.5px solid rgba(255,255,255,0.15)",
										opacity: i === lightboxIndex ? 1 : 0.5,
										cursor: "pointer",
										transition: "all 0.2s",
									}}
								>
									<img
										src={img}
										alt=""
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
											display: "block",
										}}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</>
	);
}
