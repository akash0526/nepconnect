import { useState } from "react";
import { Search, Volume2, Loader2, X } from "lucide-react";
import { speakNepali } from "../../lib/speak";

const cropDetailMsg = (crop, lang) => {
	if (!crop) return "";
	const name = crop.attributes?.name || "";
	const sun = crop.attributes?.sun_requirements || "N/A";
	const water = crop.attributes?.water_requirements || "N/A";
	const ph = crop.attributes?.ph_range || "N/A";
	const season = crop.attributes?.growing_degree_days || "N/A";
	return lang === "ne"
		? `${name} खेती: घाम ${sun}, पानी ${water}, माटो pH ${ph}, मौसम ${season}`
		: `${name}: Sun ${sun}, Water ${water}, Soil pH ${ph}, Season ${season}`;
};

export default function CropGuide({
	lang,
	search,
	onSearchChange,
	onSearch,
	results,
	selectedCrop,
	loading,
	onSelectCrop,
	onClear,
}) {
	const [showImagePicker, setShowImagePicker] = useState(false);
	// We'll later replace with a visual picker; for now keep search but add bilingual labels.

	return (
		<div className="bg-white rounded-2xl shadow p-5">
			<h2 className="font-bold text-gray-800 mb-3">
				{lang === "ne" ? "🌱 बाली जानकारी" : "🌱 Crop Guide"}
			</h2>

			<div className="flex gap-2 mb-3">
				<input
					type="text"
					placeholder={lang === "ne" ? "बाली खोज्नुहोस्" : "Search crop"}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="flex-1 p-3 bg-gray-50 border rounded-xl text-sm"
					onKeyDown={(e) => e.key === "Enter" && onSearch()}
				/>
				<button
					onClick={onSearch}
					className="bg-green-600 text-white px-4 rounded-xl"
				>
					<Search size={18} />
				</button>
			</div>

			{loading && (
				<div className="flex justify-center py-4">
					<Loader2 className="animate-spin text-green-600" size={24} />
				</div>
			)}

			{results.length > 0 && !selectedCrop && (
				<div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
					{results.map((crop) => (
						<button
							key={crop.id}
							onClick={() => onSelectCrop(crop)}
							className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm"
						>
							{crop.attributes?.name}
						</button>
					))}
				</div>
			)}

			{selectedCrop && (
				<div className="mt-4 p-4 bg-green-50 rounded-xl">
					<div className="flex justify-between items-start">
						<h3 className="font-bold text-lg">
							{selectedCrop.attributes?.name}
						</h3>
						<button onClick={onClear}>
							<X size={18} className="text-gray-400" />
						</button>
					</div>
					<p className="text-sm text-gray-600 mt-1">
						{selectedCrop.attributes?.description}
					</p>
					<div className="grid grid-cols-2 gap-2 mt-3 text-sm">
						<div>
							<span className="font-medium">
								{lang === "ne" ? "घाम" : "Sun"}:
							</span>{" "}
							{selectedCrop.attributes?.sun_requirements || "N/A"}
						</div>
						<div>
							<span className="font-medium">
								{lang === "ne" ? "पानी" : "Water"}:
							</span>{" "}
							{selectedCrop.attributes?.water_requirements || "N/A"}
						</div>
						<div>
							<span className="font-medium">
								{lang === "ne" ? "माटो pH" : "Soil pH"}:
							</span>{" "}
							{selectedCrop.attributes?.ph_range || "N/A"}
						</div>
						<div>
							<span className="font-medium">
								{lang === "ne" ? "मौसम" : "Season"}:
							</span>{" "}
							{selectedCrop.attributes?.growing_degree_days || "N/A"}
						</div>
					</div>
					<button
						onClick={() => speakNepali(cropDetailMsg(selectedCrop, lang))}
						className="mt-3 flex items-center gap-1 text-sm text-blue-600"
					>
						<Volume2 size={16} /> {lang === "ne" ? "सुन्नुहोस्" : "Listen"}
					</button>
				</div>
			)}
		</div>
	);
}
