"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapExploler({ listings }) {
	const defaultCenter = [27.7172, 85.324]; // Kathmandu

	return (
		<MapContainer
			key="map-container" // Add a stable key
			center={defaultCenter}
			zoom={12}
			style={{ height: "100%", width: "100%" }}
			className="z-0"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{listings.map(
				(item) =>
					item.latitude &&
					item.longitude && (
						<Marker
							key={item.id}
							position={[item.latitude, item.longitude]}
							icon={L.divIcon({
								className: "custom-marker",
								html: `<div style="background-color: #16a34a; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">NPR ${item.price}</div>`,
								iconSize: [30, 30],
							})}
						>
							<Popup>
								<div className="text-sm">
									<strong>{item.title}</strong>
									<br />
									NPR {item.price}
								</div>
							</Popup>
						</Marker>
					),
			)}
		</MapContainer>
	);
}
