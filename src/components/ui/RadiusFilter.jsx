"use client";
import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const RADII = [
	{ value: 0, label: "All" },
	{ value: 5, label: "5 km" },
	{ value: 10, label: "10 km" },
	{ value: 25, label: "25 km" },
	{ value: 50, label: "50 km" },
];

export default function RadiusFilter({
	onRadiusChange,
	onLocationItems,
	currentRadius,
}) {
	const [radius, setRadius] = useState(currentRadius || 0);
	const [userLocation, setUserLocation] = useState(null);
	const [gettingLocation, setGettingLocation] = useState(false);
	const [error, setError] = useState("");

	const getLocation = () => {
		if (!navigator.geolocation) {
			setError("Geolocation not supported");
			return;
		}
		setGettingLocation(true);
		setError("");

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				setUserLocation({ lat: latitude, lng: longitude });
				if (radius > 0) {
					await fetchNearby(latitude, longitude, radius);
				}
				setGettingLocation(false);
			},
			() => {
				setError("Could not get location. Please enable GPS.");
				setGettingLocation(false);
			},
			{ enableHighAccuracy: true, timeout: 10000 },
		);
	};

	const fetchNearby = async (lat, lng, rad) => {
		const latDelta = rad / 111;
		const lngDelta = rad / (111 * Math.cos((lat * Math.PI) / 180));

		const { data, error } = await supabase
			.from("listings")
			.select("*")
			.eq("status", "active")
			.gte("latitude", lat - latDelta)
			.lte("latitude", lat + latDelta)
			.gte("longitude", lng - lngDelta)
			.lte("longitude", lng + lngDelta)
			.order("created_at", { ascending: false });

		if (!error && data) {
			const nearby = data
				.filter((item) => {
					if (!item.latitude || !item.longitude) return false;
					return getDistance(lat, lng, item.latitude, item.longitude) <= rad;
				})
				.map((item) => ({
					...item,
					distance_km:
						Math.round(
							getDistance(lat, lng, item.latitude, item.longitude) * 10,
						) / 10,
				}));
			onLocationItems?.(nearby);
		}
	};

	const handleRadiusChange = async (val) => {
		setRadius(val);
		onRadiusChange?.(val);
		if (userLocation && val > 0) {
			await fetchNearby(userLocation.lat, userLocation.lng, val);
		}
	};

	const hasLocation = !!userLocation;
	const isGetting = !!gettingLocation;
	const errorMsg = error;

	return (
		<div className="flex flex-wrap items-center gap-2 mb-4">
			<MapPin size={14} className="text-[var(--color-primary)] flex-shrink-0" />

			<div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
				{RADII.map((r) => (
					<button
						key={r.value}
						onClick={() => handleRadiusChange(r.value)}
						className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
							radius === r.value
								? "bg-[var(--color-primary)] text-white shadow-sm"
								: "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
						}`}
					>
						{r.label}
					</button>
				))}
			</div>

			<button
				onClick={getLocation}
				disabled={isGetting}
				className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
					hasLocation
						? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
						: "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
				}`}
				title="Use my location"
			>
				{isGetting ? (
					<Loader2 size={12} className="animate-spin" />
				) : (
					<Navigation size={12} />
				)}
				<span>{hasLocation ? "📍" : "GPS"}</span>
			</button>

			{errorMsg.length > 0 && (
				<p className="w-full text-[10px] text-red-500 mt-0.5">{errorMsg}</p>
			)}
		</div>
	);
}

function getDistance(lat1, lon1, lat2, lon2) {
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
