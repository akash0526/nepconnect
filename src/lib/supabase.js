import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Lazy init — don't throw at module evaluation time, so static pages can build
let _supabase = null;

export function getSupabase() {
	if (!_supabase) {
		if (!supabaseUrl || !supabaseAnonKey) {
			// Return a mock client for build-time / SSR to prevent crashes
			if (typeof window === "undefined") {
				return createClient(
					"https://placeholder.supabase.co",
					"placeholder-key",
				);
			}
			throw new Error("Missing Supabase environment variables");
		}
		_supabase = createClient(supabaseUrl, supabaseAnonKey);
	}
	return _supabase;
}

// For convenience in client components
export const supabase =
	typeof window !== "undefined"
		? getSupabase()
		: createClient("https://placeholder.supabase.co", "placeholder-key");

// ── Device ID helpers ──
export const getDeviceId = () => {
	if (typeof window !== "undefined") {
		let id = localStorage.getItem("nepconnect_device_id");
		if (!id) {
			id = Math.random().toString(36).substring(2) + Date.now().toString(36);
			localStorage.setItem("nepconnect_device_id", id);
		}
		return id;
	}
	return null;
};

export const getUserName = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("nepconnect_username") || "Anonymous";
	}
	return "Anonymous";
};

// ── Profile helpers ──
export const getProfileBizType = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("nepconnect_biz_type") || "individual";
	}
	return "individual";
};

// ── DB Helper ──
export const DB = {
	// ── Reviews ──
	async getReviewsForSeller(sellerId) {
		const { data, error } = await supabase
			.from("reviews")
			.select("*, reviewer:reviewer_id (username, email)")
			.eq("seller_id", sellerId)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async getReviewsForListing(listingId) {
		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("listing_id", listingId)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async addReview(review) {
		const { data, error } = await supabase
			.from("reviews")
			.insert([review])
			.select()
			.single();
		if (error) throw error;
		return data;
	},

	async getAverageRating(sellerId) {
		const { data, error } = await supabase
			.from("reviews")
			.select("rating")
			.eq("seller_id", sellerId);
		if (error) throw error;
		if (!data || data.length === 0) return { avg: 0, count: 0 };
		const sum = data.reduce((a, b) => a + b.rating, 0);
		return { avg: (sum / data.length).toFixed(1), count: data.length };
	},

	// ── Favorites ──
	async toggleFavorite(userId, listingId, deviceId) {
		const { data: existing } = await supabase
			.from("favorites")
			.select("id")
			.eq("user_id", userId)
			.eq("listing_id", listingId)
			.single();

		if (existing) {
			await supabase.from("favorites").delete().eq("id", existing.id);
			return { favorited: false };
		} else {
			await supabase
				.from("favorites")
				.insert([
					{ user_id: userId, listing_id: listingId, device_id: deviceId },
				]);
			return { favorited: true };
		}
	},

	async toggleFavoriteByDevice(deviceId, listingId) {
		const { data: existing } = await supabase
			.from("favorites")
			.select("id")
			.is("user_id", null)
			.eq("device_id", deviceId)
			.eq("listing_id", listingId)
			.single();

		if (existing) {
			await supabase.from("favorites").delete().eq("id", existing.id);
			return { favorited: false };
		} else {
			await supabase
				.from("favorites")
				.insert([{ device_id: deviceId, listing_id: listingId }]);
			return { favorited: true };
		}
	},

	async getFavorites(userId, deviceId) {
		if (userId) {
			const { data, error } = await supabase
				.from("favorites")
				.select("*, listing:listing_id (*)")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data || [];
		}
		// Guest: use device ID
		const { data, error } = await supabase
			.from("favorites")
			.select("*, listing:listing_id (*)")
			.is("user_id", null)
			.eq("device_id", deviceId)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async isFavorited(userId, listingId, deviceId) {
		if (userId) {
			const { data } = await supabase
				.from("favorites")
				.select("id")
				.eq("user_id", userId)
				.eq("listing_id", listingId)
				.single();
			return !!data;
		}
		const { data } = await supabase
			.from("favorites")
			.select("id")
			.is("user_id", null)
			.eq("device_id", deviceId)
			.eq("listing_id", listingId)
			.single();
		return !!data;
	},

	// ── Notifications ──
	async getNotifications(userId, deviceId) {
		let query = supabase
			.from("notifications")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(50);

		if (userId) {
			query = query.eq("user_id", userId);
		} else {
			query = query.is("user_id", null).eq("device_id", deviceId);
		}

		const { data, error } = await query;
		if (error) throw error;
		return data || [];
	},

	async markNotificationRead(id) {
		await supabase.from("notifications").update({ is_read: true }).eq("id", id);
	},

	async markAllNotificationsRead(userId, deviceId) {
		let query = supabase
			.from("notifications")
			.update({ is_read: true })
			.is("is_read", false);

		if (userId) {
			query = query.eq("user_id", userId);
		} else {
			query = query.is("user_id", null).eq("device_id", deviceId);
		}

		await query;
	},

	async getUnreadCount(userId, deviceId) {
		let query = supabase
			.from("notifications")
			.select("id", { count: "exact", head: true })
			.is("is_read", false);

		if (userId) {
			query = query.eq("user_id", userId);
		} else {
			query = query.is("user_id", null).eq("device_id", deviceId);
		}

		const { count } = await query;
		return count || 0;
	},

	async createNotification(notification) {
		const { data, error } = await supabase
			.from("notifications")
			.insert([notification])
			.select();
		if (error) throw error;
		return data;
	},

	// ── Listings near a location ──
	async getListingsNear(lat, lng, radiusKm = 10) {
		const latDelta = radiusKm / 111;
		const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

		const { data, error } = await supabase
			.from("listings")
			.select("*")
			.gte("latitude", lat - latDelta)
			.lte("latitude", lat + latDelta)
			.gte("longitude", lng - lngDelta)
			.lte("longitude", lng + lngDelta)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return (data || [])
			.filter((item) => {
				if (!item.latitude || !item.longitude) return false;
				return getDistance(lat, lng, item.latitude, item.longitude) <= radiusKm;
			})
			.map((item) => ({
				...item,
				distance_km:
					Math.round(
						getDistance(lat, lng, item.latitude, item.longitude) * 10,
					) / 10,
			}));
	},

	// ── Messages / Conversations ──
	async getOrCreateConversation(listingId, buyerId, buyerDeviceId, sellerId) {
		const { data: existing } = await supabase
			.from("conversations")
			.select("*")
			.eq("listing_id", listingId)
			.eq("buyer_id", buyerId)
			.eq("seller_id", sellerId)
			.single();

		if (existing) return existing;

		const { data, error } = await supabase
			.from("conversations")
			.insert([
				{
					listing_id: listingId,
					buyer_id: buyerId,
					buyer_device_id: buyerDeviceId,
					seller_id: sellerId,
				},
			])
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async sendMessage(conversationId, senderId, senderDeviceId, text) {
		const { data, error } = await supabase
			.from("messages")
			.insert([
				{
					conversation_id: conversationId,
					sender_id: senderId,
					sender_device_id: senderDeviceId,
					text,
				},
			])
			.select()
			.single();

		if (error) throw error;

		await supabase
			.from("conversations")
			.update({ last_message_at: new Date().toISOString() })
			.eq("id", conversationId);

		return data;
	},

	async getConversations(userId, deviceId) {
		let query = supabase
			.from("conversations")
			.select(
				"*, listing:listing_id (id, title, price, image_urls), messages(*)",
			);

		if (userId) {
			query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
		} else {
			query = query.eq("buyer_device_id", deviceId);
		}

		const { data, error } = await query.order("last_message_at", {
			ascending: false,
		});
		if (error) throw error;
		return data || [];
	},

	async getMessages(conversationId) {
		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", conversationId)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return data || [];
	},

	// ── Market Prices ──
	async getMarketPrices(cropName) {
		let query = supabase
			.from("market_prices")
			.select("*")
			.order("date", { ascending: false })
			.limit(30);

		if (cropName) {
			query = query.ilike("crop_name", `%${cropName}%`);
		}

		const { data, error } = await query;
		if (error) throw error;
		return data || [];
	},

	// ── Locations (Nepal geographic hierarchy) ──
	async getProvinces() {
		const { data, error } = await supabase
			.from("locations")
			.select("*")
			.eq("level", "province")
			.order("name_en");
		if (error) throw error;
		return data || [];
	},

	async getDistricts(provinceId) {
		const { data, error } = await supabase
			.from("locations")
			.select("*")
			.eq("level", "district")
			.eq("province_id", provinceId)
			.order("name_en");
		if (error) throw error;
		return data || [];
	},

	async getMunicipalities(districtId) {
		const { data, error } = await supabase
			.from("locations")
			.select("*")
			.eq("level", "municipality")
			.eq("parent_id", districtId)
			.order("name_en");
		if (error) throw error;
		return data || [];
	},
};

// ── Haversine distance (km) ──
export function getDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}
