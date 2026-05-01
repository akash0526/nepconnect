"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Cloud, MapPin, Monitor } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";
import { useWeather } from "../../hooks/useWeather";
import { useCrops } from "../../hooks/useCrops";
import { useDiagnosis } from "../../hooks/useDiagnosis";
// import LocationModal from "../../components/farmer/LocationModal";
import WeatherWidget from "../../components/farmer/WeatherWidget";
import CropGuide from "../../components/farmer/CropGuide";
import CropDoctor from "../../components/farmer/CropDoctor";

export default function FarmerHub() {
	const weatherTools = useWeather();
	const cropTools = useCrops();
	const diagnosisTools = useDiagnosis();
	const { lang } = useLanguage();

	return (
		<div className="min-h-screen pb-20 px-4 max-w-xl mx-auto space-y-6">
			{/* Page header */}
			<div>
				<h1 className="text-3xl font-extrabold text-gray-900">
					{lang === "ne" ? "किसान हब" : "Farmer Hub"} 🌾
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					{lang === "ne"
						? "मौसम, बाली रोग, र बाली जानकारी"
						: "Weather, crop disease, and crop guide"}
				</p>

				<div className="mt-4">
					<button
						onClick={weatherTools.fetchWeather}
						disabled={weatherTools.loading}
						className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-green-200 transition disabled:opacity-50"
					>
						<span className="flex items-center">
							{weatherTools.loading ? (
								<Loader2 className="animate-spin" size={16} />
							) : (
								<Cloud size={16} />
							)}
						</span>
						<span>
							{weatherTools.loading
								? lang === "ne"
									? "लोड..."
									: "Loading..."
								: lang === "ne"
									? "मौसम हेर्नुहोस्"
									: "Check Weather"}
						</span>
					</button>
				</div>
			</div>

			{weatherTools.error && (
				<div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">
					{weatherTools.error}
				</div>
			)}

			{weatherTools.simpleWeather && (
				<WeatherWidget simple={weatherTools.simpleWeather} lang={lang} />
			)}

			<CropGuide
				lang={lang}
				search={cropTools.search}
				onSearchChange={cropTools.setSearch}
				onSearch={cropTools.searchCrops}
				results={cropTools.results}
				selectedCrop={cropTools.selectedCrop}
				loading={cropTools.loading}
				onSelectCrop={cropTools.getCropDetails}
				onClear={cropTools.clearCrop}
			/>

			<CropDoctor
				simplified={diagnosisTools.simplifiedDiagnosis}
				loading={diagnosisTools.loading}
				onCapture={diagnosisTools.handleLeafCapture}
				onDiagnose={diagnosisTools.runDiagnosis}
				onClear={diagnosisTools.clear}
				leafImage={diagnosisTools.leafImage}
				lang={lang}
			/>
		</div>
	);
}
