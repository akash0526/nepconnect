"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

export default function MapExploler({ listings }) {
	const [isMounted, setIsMounted] = useState(false);
	const defaultPos = [27.7172, 85.324]; // Kathmandu

	// 1. Only render the map AFTER the component has mounted on the client
	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">
				<p className="text-gray-400 text-sm">Initializing Map...</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<MapContainer
				center={defaultPos}
				zoom={13}
				scrollWheelZoom={false}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{listings.map(
					(item) =>
						item.latitude &&
						item.longitude && (
							<Marker key={item.id} position={[item.latitude, item.longitude]}>
								<Popup>
									<div className="font-sans">
										<h3 className="font-bold">{item.title}</h3>
										<p className="text-green-600 font-bold">NPR {item.price}</p>
									</div>
								</Popup>
							</Marker>
						),
				)}
			</MapContainer>
		</div>
	);
}
