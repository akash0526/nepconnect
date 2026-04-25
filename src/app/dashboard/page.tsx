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
	const [activeTab, setActiveTab] = useState<"listings" | "sell">("listings");

	// device_id is stored in the JWT at login time — it matches user_id on listings
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
					// No device_id linked yet — user must log out and back in
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

	const conditionStyle = (c?: string): { bg: string; color: string } => {
		const map: Record<string, { bg: string; color: string }> = {
			New: { bg: "#eaf3de", color: "#27500a" },
			"Like New": { bg: "#eaf3de", color: "#27500a" },
			Good: { bg: "#faeeda", color: "#633806" },
			Fair: { bg: "#faece7", color: "#712b13" },
			"For Parts": { bg: "#fcebeb", color: "#791f1f" },
		};
		return c
			? (map[c] ?? {
					bg: "var(--color-background-secondary)",
					color: "var(--color-text-secondary)",
				})
			: {
					bg: "var(--color-background-secondary)",
					color: "var(--color-text-secondary)",
				};
	};

	const timeAgo = (d: string) => {
		const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days}d ago`;
		if (days < 30) return `${Math.floor(days / 7)}w ago`;
		return new Date(d).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	const initials = user?.username?.slice(0, 2).toUpperCase() ?? "..";
	const verified = listings.filter((l) => l.is_verified).length;
	const totalValue = listings.reduce((s, l) => s + (l.price || 0), 0);

	return (
		<main
			style={{
				minHeight: "100vh",
				background: "var(--color-background-tertiary)",
				paddingBottom: "6rem",
			}}
		>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        .d { font-family: 'Sora', var(--font-sans); }
        .lcard { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); overflow: hidden; transition: border-color 0.15s; }
        .lcard:hover { border-color: var(--color-border-secondary); }
        .tbtn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 100px; transition: background 0.15s, color 0.15s; color: var(--color-text-secondary); }
        .tbtn.on { background: var(--color-background-primary); color: var(--color-text-primary); border: 0.5px solid var(--color-border-secondary); }
        .dbtn { background: none; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 5px 7px; cursor: pointer; color: var(--color-text-tertiary); display: flex; align-items: center; transition: all 0.15s; flex-shrink: 0; }
        .dbtn:hover { background: var(--color-background-danger); color: var(--color-text-danger); border-color: var(--color-border-danger); }
        .abtn { flex: 1; padding: 7px 0; border-radius: var(--border-radius-md); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px; border: 0.5px solid var(--color-border-tertiary); background: none; cursor: pointer; color: var(--color-text-secondary); font-family: inherit; transition: background 0.15s; }
        .abtn.c { color: var(--color-text-info); border-color: var(--color-border-info); }
        .abtn.c:hover { background: var(--color-background-info); }
        .abtn.w { color: var(--color-text-success); border-color: var(--color-border-success); }
        .abtn.w:hover { background: var(--color-background-success); }
        .logbtn { display: flex; align-items: center; gap: 6px; background: none; border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 7px 13px; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--color-text-secondary); font-family: inherit; transition: all 0.15s; }
        .logbtn:hover { background: var(--color-background-danger); color: var(--color-text-danger); border-color: var(--color-border-danger); }
        @keyframes fu { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fu 0.3s ease both; }
        @keyframes sp { to { transform: rotate(360deg); } }
        .sp { width:18px; height:18px; border:2px solid var(--color-border-secondary); border-top-color:var(--color-text-secondary); border-radius:50%; animation: sp 0.7s linear infinite; }
      `}</style>

			<div className="d">
				{/* Header */}
				<div
					style={{
						background: "var(--color-background-primary)",
						borderBottom: "0.5px solid var(--color-border-tertiary)",
						padding: "1.25rem",
						maxWidth: 560,
						margin: "0 auto",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							<div
								style={{
									width: 44,
									height: 44,
									borderRadius: 13,
									background: "#639922",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#eaf3de",
									fontSize: 15,
									fontWeight: 700,
									flexShrink: 0,
								}}
							>
								{initials}
							</div>
							<div>
								<p
									style={{
										margin: 0,
										fontSize: 10,
										fontWeight: 700,
										letterSpacing: 0.8,
										textTransform: "uppercase",
										color: "var(--color-text-tertiary)",
									}}
								>
									Dashboard
								</p>
								<p
									style={{
										margin: 0,
										fontSize: 16,
										fontWeight: 700,
										color: "var(--color-text-primary)",
										lineHeight: 1.2,
									}}
								>
									{loadingUser ? "…" : user?.username}
								</p>
							</div>
						</div>
						<button className="logbtn" onClick={handleLogout}>
							<LogOut size={12} /> Sign out
						</button>
					</div>
				</div>

				<div style={{ maxWidth: 560, margin: "0 auto", padding: "1.25rem" }}>
					{/* Stats */}
					<div
						className="fu"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0,1fr))",
							gap: 10,
							marginBottom: 16,
						}}
					>
						{[
							{
								icon: <Package size={12} />,
								label: "Active",
								value: String(listings.length),
								color: "var(--color-text-primary)",
							},
							{
								icon: <Tag size={12} />,
								label: "Total Value",
								value: `NPR ${totalValue.toLocaleString()}`,
								color: "#3b6d11",
							},
						].map(({ icon, label, value, color }) => (
							<div
								key={label}
								style={{
									background: "var(--color-background-primary)",
									border: "0.5px solid var(--color-border-tertiary)",
									borderRadius: "var(--border-radius-lg)",
									padding: "13px 15px",
								}}
							>
								<p
									style={{
										margin: "0 0 5px",
										fontSize: 11,
										fontWeight: 600,
										letterSpacing: 0.5,
										textTransform: "uppercase",
										color: "var(--color-text-tertiary)",
										display: "flex",
										alignItems: "center",
										gap: 5,
									}}
								>
									{icon} {label}
								</p>
								<p
									style={{
										margin: 0,
										fontSize: value.length > 10 ? 15 : 26,
										fontWeight: 800,
										color,
										lineHeight: 1,
									}}
								>
									{value}
								</p>
							</div>
						))}
					</div>

					{/* Verified badge */}
					{!loadingListings && verified > 0 && (
						<div
							className="fu"
							style={{
								animationDelay: "0.05s",
								background: "#eaf3de",
								border: "0.5px solid #c0dd97",
								borderRadius: "var(--border-radius-lg)",
								padding: "10px 14px",
								display: "flex",
								alignItems: "center",
								gap: 9,
								marginBottom: 16,
							}}
						>
							<ShieldCheck
								size={14}
								color="#3b6d11"
								style={{ flexShrink: 0 }}
							/>
							<span style={{ fontSize: 12, fontWeight: 600, color: "#27500a" }}>
								{verified} listing{verified > 1 ? "s" : ""} AI-verified — buyers
								trust these more
							</span>
						</div>
					)}

					{/* Tabs */}
					<div
						className="fu"
						style={{
							animationDelay: "0.07s",
							display: "flex",
							gap: 5,
							background: "var(--color-background-secondary)",
							borderRadius: 100,
							padding: 3,
							marginBottom: 16,
						}}
					>
						<button
							className={`tbtn ${activeTab === "listings" ? "on" : ""}`}
							onClick={() => setActiveTab("listings")}
						>
							My Listings {!loadingListings && `(${listings.length})`}
						</button>
						<button
							className={`tbtn ${activeTab === "sell" ? "on" : ""}`}
							onClick={() => setActiveTab("sell")}
						>
							+ Sell
						</button>
					</div>

					{/* Listings tab */}
					{activeTab === "listings" && (
						<div className="fu" style={{ animationDelay: "0.09s" }}>
							{loadingListings ? (
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										padding: "3rem 0",
									}}
								>
									<div className="sp" style={{ width: 24, height: 24 }} />
								</div>
							) : listings.length === 0 ? (
								<div
									style={{
										background: "var(--color-background-primary)",
										border: "0.5px solid var(--color-border-tertiary)",
										borderRadius: "var(--border-radius-lg)",
										padding: "2.5rem 1.5rem",
										textAlign: "center",
									}}
								>
									<div
										style={{
											width: 46,
											height: 46,
											background: "#eaf3de",
											borderRadius: 14,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											margin: "0 auto 12px",
										}}
									>
										<Package size={20} color="#3b6d11" />
									</div>
									<p
										style={{
											fontWeight: 700,
											margin: "0 0 5px",
											color: "var(--color-text-primary)",
										}}
									>
										No listings yet
									</p>
									<p
										style={{
											fontSize: 13,
											color: "var(--color-text-tertiary)",
											margin: "0 0 18px",
										}}
									>
										Post something and reach local buyers.
									</p>
									<Link
										href="/add-listing"
										style={{
											display: "inline-flex",
											alignItems: "center",
											gap: 6,
											background: "#639922",
											color: "#eaf3de",
											padding: "10px 22px",
											borderRadius: "var(--border-radius-md)",
											fontWeight: 700,
											fontSize: 13,
											textDecoration: "none",
										}}
									>
										<Plus size={13} /> Create listing
									</Link>
								</div>
							) : (
								<div
									style={{ display: "flex", flexDirection: "column", gap: 10 }}
								>
									{listings.map((item, i) => {
										const img = thumb(item);
										const cs = conditionStyle(item.ai_condition_report);
										return (
											<div
												key={item.id}
												className="lcard"
												style={{ animationDelay: `${0.09 + i * 0.04}s` }}
											>
												<div style={{ display: "flex" }}>
													{/* Image */}
													<Link
														href={`/product/${item.id}`}
														style={{
															flexShrink: 0,
															display: "block",
															position: "relative",
															textDecoration: "none",
														}}
													>
														{img ? (
															<img
																src={img}
																alt={item.title}
																style={{
																	width: 88,
																	height: 88,
																	objectFit: "cover",
																	display: "block",
																}}
															/>
														) : (
															<div
																style={{
																	width: 88,
																	height: 88,
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "center",
																	background:
																		"var(--color-background-secondary)",
																}}
															>
																<Package
																	size={22}
																	color="var(--color-text-tertiary)"
																/>
															</div>
														)}
														{item.is_verified && (
															<div
																style={{
																	position: "absolute",
																	top: 5,
																	left: 5,
																	background: "#185fa5",
																	borderRadius: 5,
																	padding: "2px 4px",
																}}
															>
																<ShieldCheck size={9} color="#e6f1fb" />
															</div>
														)}
														{(item.image_urls?.length ?? 0) > 1 && (
															<div
																style={{
																	position: "absolute",
																	bottom: 4,
																	right: 4,
																	background: "rgba(0,0,0,0.55)",
																	borderRadius: 5,
																	padding: "1px 5px",
																	fontSize: 9,
																	color: "#fff",
																	fontWeight: 700,
																}}
															>
																+{item.image_urls!.length - 1}
															</div>
														)}
													</Link>

													{/* Info */}
													<div
														style={{
															flex: 1,
															padding: "10px 11px",
															display: "flex",
															flexDirection: "column",
															justifyContent: "space-between",
															minWidth: 0,
														}}
													>
														<div>
															<div
																style={{
																	display: "flex",
																	alignItems: "flex-start",
																	gap: 6,
																	justifyContent: "space-between",
																}}
															>
																<Link
																	href={`/product/${item.id}`}
																	style={{
																		fontWeight: 700,
																		fontSize: 13,
																		color: "var(--color-text-primary)",
																		textDecoration: "none",
																		lineHeight: 1.25,
																		overflow: "hidden",
																		display: "-webkit-box",
																		WebkitLineClamp: 1,
																		WebkitBoxOrient: "vertical",
																	}}
																>
																	{item.title}
																</Link>
																<button
																	className="dbtn"
																	onClick={() => handleDelete(item.id)}
																	disabled={deleting === item.id}
																	title="Mark as sold"
																>
																	{deleting === item.id ? (
																		<div className="sp" />
																	) : (
																		<Trash2 size={11} />
																	)}
																</button>
															</div>

															<p
																style={{
																	margin: "3px 0 6px",
																	fontSize: 15,
																	fontWeight: 800,
																	color: "#3b6d11",
																	lineHeight: 1,
																}}
															>
																NPR {item.price?.toLocaleString()}
															</p>

															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: 6,
																	flexWrap: "wrap",
																}}
															>
																{item.ai_condition_report && (
																	<span
																		style={{
																			fontSize: 10,
																			fontWeight: 700,
																			background: cs.bg,
																			color: cs.color,
																			borderRadius: 5,
																			padding: "1px 6px",
																		}}
																	>
																		{item.ai_condition_report}
																	</span>
																)}
																<span
																	style={{
																		fontSize: 10,
																		color: "var(--color-text-tertiary)",
																		display: "flex",
																		alignItems: "center",
																		gap: 2,
																	}}
																>
																	<Clock size={9} /> {timeAgo(item.created_at)}
																</span>
																{item.manual_address && (
																	<span
																		style={{
																			fontSize: 10,
																			color: "var(--color-text-tertiary)",
																			display: "flex",
																			alignItems: "center",
																			gap: 2,
																			overflow: "hidden",
																			whiteSpace: "nowrap",
																			textOverflow: "ellipsis",
																			maxWidth: 110,
																		}}
																	>
																		<MapPin size={9} /> {item.manual_address}
																	</span>
																)}
															</div>
														</div>

														{item.phone && (
															<div
																style={{
																	display: "flex",
																	gap: 5,
																	marginTop: 8,
																}}
															>
																<button
																	className="abtn c"
																	onClick={() => {
																		window.location.href = `tel:${item.phone}`;
																	}}
																>
																	<Phone size={10} /> Call
																</button>
																<button
																	className="abtn w"
																	onClick={() => {
																		const msg = `Namaste! I saw your ${item.title} on NepConnect.`;
																		window.open(
																			`https://wa.me/977${item.phone?.replace(/\s/g, "")}?text=${encodeURIComponent(msg)}`,
																			"_blank",
																		);
																	}}
																>
																	<MessageCircle size={10} /> WhatsApp
																</button>
															</div>
														)}
													</div>
												</div>

												{/* AI footer */}
												{item.ai_detected_item && (
													<div
														style={{
															borderTop:
																"0.5px solid var(--color-border-tertiary)",
															padding: "7px 11px",
															display: "flex",
															alignItems: "center",
															gap: 5,
														}}
													>
														<Sparkles
															size={10}
															color="var(--color-text-info)"
														/>
														<span
															style={{
																fontSize: 11,
																color: "var(--color-text-secondary)",
															}}
														>
															{item.ai_detected_item}
														</span>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					)}

					{/* Sell tab */}
					{activeTab === "sell" && (
						<div className="fu" style={{ animationDelay: "0.09s" }}>
							<div
								style={{
									background: "var(--color-background-primary)",
									border: "0.5px solid var(--color-border-tertiary)",
									borderRadius: "var(--border-radius-lg)",
									padding: "2rem 1.5rem",
									textAlign: "center",
									marginBottom: 14,
								}}
							>
								<div
									style={{
										width: 48,
										height: 48,
										background: "#eaf3de",
										borderRadius: 14,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										margin: "0 auto 12px",
									}}
								>
									<Plus size={22} color="#3b6d11" />
								</div>
								<p
									style={{
										fontWeight: 700,
										margin: "0 0 5px",
										color: "var(--color-text-primary)",
										fontSize: 15,
									}}
								>
									New listing
								</p>
								<p
									style={{
										fontSize: 13,
										color: "var(--color-text-tertiary)",
										margin: "0 0 18px",
										lineHeight: 1.6,
									}}
								>
									Photo + price → AI writes description and condition for you.
								</p>
								<Link
									href="/add-listing"
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: 7,
										background: "#639922",
										color: "#eaf3de",
										padding: "11px 26px",
										borderRadius: "var(--border-radius-md)",
										fontWeight: 700,
										fontSize: 14,
										textDecoration: "none",
									}}
								>
									<Plus size={14} /> Start listing
								</Link>
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								{[
									{
										icon: <Sparkles size={13} color="#185fa5" />,
										t: "AI condition report",
										d: "Upload a photo — Claude rates New / Good / Fair automatically.",
									},
									{
										icon: <ShieldCheck size={13} color="#3b6d11" />,
										t: "Verification badge",
										d: "Verified listings get significantly more buyer inquiries.",
									},
									{
										icon: <MapPin size={13} color="#993c1d" />,
										t: "Map pinning",
										d: "Nearby buyers see your listing on the live map.",
									},
								].map(({ icon, t, d }) => (
									<div
										key={t}
										style={{
											background: "var(--color-background-primary)",
											border: "0.5px solid var(--color-border-tertiary)",
											borderRadius: "var(--border-radius-lg)",
											padding: "11px 13px",
											display: "flex",
											alignItems: "flex-start",
											gap: 10,
										}}
									>
										<div style={{ marginTop: 1 }}>{icon}</div>
										<div>
											<p
												style={{
													margin: "0 0 2px",
													fontSize: 13,
													fontWeight: 700,
													color: "var(--color-text-primary)",
												}}
											>
												{t}
											</p>
											<p
												style={{
													margin: 0,
													fontSize: 12,
													color: "var(--color-text-tertiary)",
													lineHeight: 1.5,
												}}
											>
												{d}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* FAB */}
			<Link
				href="/add-listing"
				style={{
					position: "fixed",
					bottom: "2rem",
					right: "1.5rem",
					background: "#639922",
					color: "#eaf3de",
					borderRadius: 16,
					padding: "13px 18px",
					display: "flex",
					alignItems: "center",
					gap: 7,
					fontFamily: "'Sora', var(--font-sans)",
					fontWeight: 700,
					fontSize: 13,
					textDecoration: "none",
					boxShadow: "0 4px 18px rgba(99,153,34,0.3)",
					zIndex: 50,
				}}
			>
				<Plus size={15} /> Sell
			</Link>
		</main>
	);
}
