"use client";
import {
	MapContainer,
	TileLayer,
	WMSTileLayer,
	FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix default Leaflet icon
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Component to forward map clicks
function MapClickHandler({ onClick }) {
	useMapEvents({
		click(e) {
			onClick(e.latlng);
		},
	});
	return null;
}

// Component to forward draw events
function DrawHandler({ onCreated }) {
	useMapEvents({
		"draw:created": (e) => {
			onCreated(e);
		},
	});
	return null;
}

export default function FieldMap({ onMapClick, onPolygonCreated }) {
	return (
		<MapContainer
			center={[27.7172, 85.324]}
			zoom={14}
			style={{ height: "400px", width: "100%" }}
			className="z-0"
		>
			{/* ESRI Satellite imagery */}
			<TileLayer
				attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
				url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
			/>

			{/* NASA GIBS MODIS NDVI overlay (16‑day composite) */}
			<WMSTileLayer
				url="https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi"
				layers="MODIS_Terra_NDVI_16Day"
				format="image/png"
				transparent={true}
				opacity={0.5}
				attribution='&copy; <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>'
			/>

			<MapClickHandler onClick={onMapClick} />

			{/* Drawing tools */}
			<FeatureGroup>
				<EditControl
					position="topright"
					draw={{
						rectangle: true,
						polygon: true,
						circle: false,
						circlemarker: false,
						marker: false,
						polyline: false,
					}}
					edit={{ edit: false, remove: true }}
				/>
				<DrawHandler onCreated={onPolygonCreated} />
			</FeatureGroup>
		</MapContainer>
	);
}
