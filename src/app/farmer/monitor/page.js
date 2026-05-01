"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Info, Ruler, X } from "lucide-react";
import { speakNepali } from "../../../lib/speak";

const FieldMap = dynamic(() => import("../../../components/FieldMap"), {
	ssr: false,
	loading: () => (
		<div className="h-[400px] w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
			<Loader2 className="animate-spin text-green-600" size={32} />
		</div>
	),
});

// Soil helper
const getSimpleSoil = (soilData) => {
	if (!soilData) return null;
	const clay = parseFloat(soilData["Clay (%)"]) || 0;
	const sand = parseFloat(soilData["Sand (%)"]) || 0;
	const silt = parseFloat(soilData["Silt (%)"]) || 0;
	let type = "दोमट";
	let icon = "🟫";
	if (sand > 50) {
		type = "बालुवा";
		icon = "🟡";
	} else if (clay > 40) {
		type = "हिलो";
		icon = "🔴";
	} else if (silt > 50) {
		type = "गाड";
		icon = "🟠";
	}
	const messageMap = {
		बालुवा: "बालुवा माटो – पानी छिट्टै बग्छ, धेरै सिँचाइ आवश्यक।",
		हिलो: "हिलो माटो – पानी जम्मा हुनसक्छ, राम्रो निकास जरुरी।",
		गाड: "गाड माटो – मलिलो, पानी राम्ररी राख्छ।",
		दोमट: "दोमट माटो – उत्तम! पानी र हावा दुवै राम्रोसँग रहन्छ।",
	};
	return { type, icon, message: messageMap[type] };
};

const haToRopani = (ha) => {
	const value = parseFloat(ha);
	if (isNaN(value)) return null;
	const ropani = Math.round(value * 19.66);
	return `${ropani} रोपनी`;
};

export default function FieldMonitor() {
	const [selectedPoint, setSelectedPoint] = useState(null);
	const [soilData, setSoilData] = useState(null);
	const [loadingSoil, setLoadingSoil] = useState(false);
	const [fieldArea, setFieldArea] = useState(null);

	const handleMapClick = async (latlng) => {
		setSelectedPoint(latlng);
		setLoadingSoil(true);
		try {
			const res = await fetch(
				`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${latlng.lng}&lat=${latlng.lat}&property=bdod&property=clay&property=sand&property=silt&property=phh2o&property=nitrogen&property=ocd&depth=0-5cm&value=mean`,
			);
			const data = await res.json();
			const properties = {};
			if (data.properties?.layers) {
				data.properties.layers.forEach((layer) => {
					const nameMap = {
						bdod: "Bulk Density (g/cm³)",
						clay: "Clay (%)",
						sand: "Sand (%)",
						silt: "Silt (%)",
						phh2o: "pH (water)",
						nitrogen: "Nitrogen (cg/kg)",
						ocd: "Organic Carbon (g/kg)",
					};
					if (nameMap[layer.name]) {
						properties[nameMap[layer.name]] =
							layer.depths?.[0]?.values?.mean?.toFixed(2) || "N/A";
					}
				});
			}
			setSoilData(properties);
		} catch (err) {
			console.error("Soil data error:", err);
			setSoilData(null);
		} finally {
			setLoadingSoil(false);
		}
	};

	const handlePolygonCreated = (e) => {
		const latlngs = e.layer.getLatLngs()[0];
		let area = 0;
		try {
			// Use window.L which is available after the map loads on the client
			area = window.L.GeometryUtil.geodesicArea(latlngs) / 10000; // hectares
		} catch (err) {
			console.error("Area calculation failed:", err);
			area = 0;
		}
		setFieldArea(area.toFixed(2));
	};

	const simpleSoil = getSimpleSoil(soilData);

	return (
		<div className="min-h-screen bg-gray-50 pb-20 font-sans">
			<div className="bg-green-700 text-white p-6 rounded-b-[40px] shadow-lg">
				<h1 className="text-3xl font-extrabold">खेत निगरानी 🛰️</h1>
				<p className="text-sm opacity-80 mt-1">
					उपग्रह दृश्य, माटो जानकारी, र खेत मापन
				</p>
			</div>

			<div className="max-w-xl mx-auto p-4 -mt-6 space-y-6">
				<div className="bg-white rounded-2xl shadow overflow-hidden">
					<FieldMap
						onMapClick={handleMapClick}
						onPolygonCreated={handlePolygonCreated}
					/>
				</div>

				{selectedPoint && (
					<div className="bg-white rounded-2xl shadow p-5">
						<div className="flex justify-between items-center mb-3">
							<h2 className="font-bold text-gray-800 flex items-center gap-2">
								<Info size={20} /> माटोको जानकारी
							</h2>
							<button
								onClick={() => {
									setSelectedPoint(null);
									setSoilData(null);
								}}
							>
								<X size={18} className="text-gray-400" />
							</button>
						</div>

						{loadingSoil ? (
							<div className="flex justify-center py-4">
								<Loader2 className="animate-spin text-green-600" size={24} />
							</div>
						) : simpleSoil ? (
							<div className="text-center">
								<span className="text-4xl">{simpleSoil.icon}</span>
								<p className="font-bold text-lg mt-2">{simpleSoil.type}</p>
								<p className="text-sm text-gray-600 mt-1">
									{simpleSoil.message}
								</p>
								<button
									onClick={() => speakNepali(simpleSoil.message)}
									className="mt-2 text-blue-600 text-xs underline flex items-center justify-center gap-1"
								>
									🔊 सुन्नुहोस्
								</button>
							</div>
						) : (
							<p className="text-red-500 text-sm">माटोको डेटा लोड हुन सकेन।</p>
						)}
					</div>
				)}

				{fieldArea && (
					<div className="bg-white rounded-2xl shadow p-5">
						<h2 className="font-bold text-gray-800 flex items-center gap-2">
							<Ruler size={20} /> खेतको क्षेत्रफल
						</h2>
						<div className="text-center mt-2">
							<span className="text-3xl">🌾</span>
							<p className="text-2xl font-bold text-green-600">
								{haToRopani(fieldArea)}
							</p>
							<p className="text-xs text-gray-500">तपाईंको खेत</p>
							<button
								onClick={() =>
									speakNepali(
										`तपाईंको खेत क्षेत्रफल ${haToRopani(fieldArea)} रोपनी रहेको छ।`,
									)
								}
								className="mt-2 text-blue-600 text-xs underline flex items-center justify-center gap-1"
							>
								🔊 सुन्नुहोस्
							</button>
							<button
								onClick={() => setFieldArea(null)}
								className="mt-2 text-sm text-gray-500 underline w-full"
							>
								मेटाउनुहोस्
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
