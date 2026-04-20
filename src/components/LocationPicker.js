"use client";
import { useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import { Search, X, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icons in Next.js
const customIcon = new L.Icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

function MapClickHandler({ onSelect }) {
	useMapEvents({
		click(e) {
			onSelect(e.latlng);
		},
	});
	return null;
}

function MapFlyer({ center }) {
	const map = useMap();
	if (center) map.flyTo(center, 14);
	return null;
}

export default function LocationPicker({ onLocationChange }) {
	const [pos, setPos] = useState(null);
	const [query, setQuery] = useState("");
	const [searching, setSearching] = useState(false);

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!query) return;
		setSearching(true);
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${query}, Nepal`,
			);
			const data = await res.json();
			if (data?.[0]) {
				const newPos = {
					lat: parseFloat(data[0].lat),
					lng: parseFloat(data[0].lon),
				};
				setPos(newPos);
				onLocationChange(newPos);
			}
		} catch (err) {
			console.error(err);
		}
		setSearching(false);
	};

	return (
		<div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
			<div className="flex justify-between items-center">
				<label className="text-sm font-bold text-gray-700">
					Location (Optional)
				</label>
				{pos && (
					<button
						type="button"
						onClick={() => {
							setPos(null);
							onLocationChange(null);
						}}
						className="text-xs text-red-500 flex items-center gap-1"
					>
						<X size={14} /> Clear
					</button>
				)}
			</div>

			<div className="flex gap-2">
				<input
					type="text"
					placeholder="Search area (e.g. Pokhara, Koteshwor)"
					className="flex-1 p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-green-500"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button
					type="button"
					onClick={handleSearch}
					className="bg-green-600 text-white p-3 rounded-xl"
				>
					{searching ? (
						<Loader2 className="animate-spin" size={18} />
					) : (
						<Search size={18} />
					)}
				</button>
			</div>

			<div className="h-44 rounded-xl overflow-hidden border border-gray-200 z-0">
				<MapContainer
					center={[28.3949, 84.124]}
					zoom={6}
					className="h-full w-full"
				>
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
					<MapClickHandler
						onSelect={(l) => {
							setPos(l);
							onLocationChange(l);
						}}
					/>
					{pos && <Marker position={pos} icon={customIcon} />}
					<MapFlyer center={pos} />
				</MapContainer>
			</div>
		</div>
	);
}
