"use client";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function MapUpdater({ center }) {
	const map = useMap();
	useEffect(() => {
		if (center && center[0] && center[1]) {
			map.setView(center, map.getZoom());
		}
	}, [center, map]);
	return null;
}

function LocationMarker({ position, onLocationChange }) {
	const [markerPos, setMarkerPos] = useState(null);

	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			setMarkerPos([lat, lng]);
			onLocationChange({ lat, lng });
		},
	});

	useEffect(() => {
		if (position && position.lat && position.lng) {
			setMarkerPos([position.lat, position.lng]);
		}
	}, [position]);

	return markerPos ? <Marker position={markerPos} /> : null;
}

export default function LocationPicker({ onLocationChange, externalPosition }) {
	const defaultCenter = [27.7172, 85.324];
	const [center, setCenter] = useState(defaultCenter);
	const [markerPosition, setMarkerPosition] = useState(null);

	useEffect(() => {
		if (externalPosition && externalPosition.lat && externalPosition.lng) {
			setCenter([externalPosition.lat, externalPosition.lng]);
			setMarkerPosition([externalPosition.lat, externalPosition.lng]);
		}
	}, [externalPosition]);

	const handleLocationChange = (pos) => {
		setMarkerPosition([pos.lat, pos.lng]);
		onLocationChange(pos);
	};

	return (
		<MapContainer
			center={center}
			zoom={13}
			style={{ height: "200px", width: "100%" }}
			className="rounded-xl z-0"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MapUpdater center={center} />
			<LocationMarker
				position={markerPosition}
				onLocationChange={handleLocationChange}
			/>
		</MapContainer>
	);
}
