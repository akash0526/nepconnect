"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase, getDeviceId } from "../../lib/supabase";

export default function FavoriteButton({ listingId, userId, size = 22, className = "" }) {
	const [favorited, setFavorited] = useState(false);
	const [loading, setLoading] = useState(false);
	const deviceId = getDeviceId();

	useEffect(() => {
		if (!listingId) return;
		checkFavorited();
	}, [listingId, userId]);

	const checkFavorited = async () => {
		if (userId) {
			const { data } = await supabase
				.from("favorites")
				.select("id")
				.eq("user_id", userId)
				.eq("listing_id", listingId)
				.single();
			setFavorited(!!data);
		} else if (deviceId) {
			const { data } = await supabase
				.from("favorites")
				.select("id")
				.is("user_id", null)
				.eq("device_id", deviceId)
				.eq("listing_id", listingId)
				.single();
			setFavorited(!!data);
		}
	};

	const toggle = async (e) => {
		e?.preventDefault();
		e?.stopPropagation();
		if (loading) return;
		setLoading(true);

		try {
			if (favorited) {
				// Remove
				if (userId) {
					await supabase
						.from("favorites")
						.delete()
						.eq("user_id", userId)
						.eq("listing_id", listingId);
				} else {
					await supabase
						.from("favorites")
						.delete()
						.is("user_id", null)
						.eq("device_id", deviceId)
						.eq("listing_id", listingId);
				}
				setFavorited(false);
			} else {
				// Add
				const insertData = { listing_id: listingId };
				if (userId) {
					insertData.user_id = userId;
					insertData.device_id = deviceId;
				} else {
					insertData.device_id = deviceId;
				}
				await supabase.from("favorites").insert([insertData]);
				setFavorited(true);

				// Notify seller
				const { data: listing } = await supabase
					.from("listings")
					.select("seller_id")
					.eq("id", listingId)
					.single();
				if (listing?.seller_id && listing.seller_id !== userId) {
					await supabase.from("notifications").insert([{
						user_id: listing.seller_id,
						type: "favorite",
						title: "Someone saved your listing!",
						data: { listing_id: listingId },
						link: `/product/${listingId}`,
					}]);
				}
			}
		} catch (err) {
			console.error("Favorite toggle error:", err);
		}
		setLoading(false);
	};

	return (
		<button
			onClick={toggle}
			disabled={loading}
			className={`p-2 rounded-full transition-all active:scale-90 ${
				favorited
					? "bg-red-50 dark:bg-red-900/30 text-red-500"
					: "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
			} ${className}`}
			title={favorited ? "Remove from favorites" : "Add to favorites"}
		>
			<Heart
				size={size}
				className={favorited ? "fill-red-500" : ""}
				strokeWidth={favorited ? 2.5 : 1.8}
			/>
		</button>
	);
}