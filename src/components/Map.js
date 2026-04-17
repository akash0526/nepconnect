"use client";
import { MapContainer, TitleLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
	iconUrl: "/images/marker-icon.png",
	shadowUrl: "/images/marker-shadow.png",
});

export default function Map({ latitude, longitude }) {
	return (
		<div style={{ height: "400px", width: "100%", zIndex: 0 }}>
			<MapContainer
				center={[latitude || 27.7172, longitude || 85.324]}
				zoom={13}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{latitude && <Marker position={[latitude, longitude]} icon={icon} />}
			</MapContainer>
		</div>
	);
}
