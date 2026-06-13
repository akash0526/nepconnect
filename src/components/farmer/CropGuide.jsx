import { Volume2, X, Sun, Droplets, Beaker, Calendar } from "lucide-react";
import { speakNepali } from "../../lib/speak";

const cropDetailMsg = (crop, lang) => {
	if (!crop) return "";
	const name = crop?.attributes?.name || "";
	const sun = crop?.attributes?.sun_requirements || "N/A";
	const water = crop?.attributes?.water_requirements || "N/A";
	const ph = crop?.attributes?.ph_range || "N/A";
	const season = crop?.attributes?.growing_degree_days || "N/A";
	return lang === "ne"
		? `${name} खेती: घाम ${sun}, पानी ${water}, माटो pH ${ph}, मौसम ${season}`
		: `${name}: Sun ${sun}, Water ${water}, Soil pH ${ph}, Season ${season}`;
};

export default function CropGuide({ lang, onClear, selectedCrop }) {
	const crop = selectedCrop;
	if (!crop) return null;

	return (
		<div className="rounded-2xl shadow-md overflow-hidden border border-green-100 dark:border-green-900 bg-white dark:bg-slate-800 animate-slide-up">
			<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 border-b border-green-100 dark:border-green-800">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
							🌱
						</div>
						<div>
							<h3 className="font-black text-lg text-gray-900 dark:text-gray-100">
								{crop?.attributes?.name}
							</h3>
							{crop?.attributes?.binomial_name && (
								<p className="text-xs text-gray-500 italic">
									{crop.attributes.binomial_name}
								</p>
							)}
						</div>
					</div>
					<button onClick={onClear} className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl transition">
						<X size={18} className="text-gray-400" />
					</button>
				</div>
			</div>

			<div className="p-4 space-y-3">
				{crop?.attributes?.description && (
					<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
						{crop.attributes.description}
					</p>
				)}

				<div className="grid grid-cols-2 gap-2.5 mt-3">
					<div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
						<div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">
							<Sun size={12} /> Sun
						</div>
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{crop?.attributes?.sun_requirements || "N/A"}
						</p>
					</div>
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
						<div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
							<Droplets size={12} /> Water
						</div>
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{crop?.attributes?.water_requirements || "N/A"}
						</p>
					</div>
					<div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
						<div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
							<Beaker size={12} /> Soil pH
						</div>
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{crop?.attributes?.ph_range || "N/A"}
						</p>
					</div>
					<div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
						<div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">
							<Calendar size={12} /> Season
						</div>
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{crop?.attributes?.growing_degree_days || "N/A"}
						</p>
					</div>
				</div>

				{crop?.attributes?.sowing_method && (
					<div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3.5 mt-2">
						<p className="text-xs font-bold text-gray-500 uppercase mb-1">🌱 Sowing</p>
						<p className="text-sm text-gray-700 dark:text-gray-300">{crop.attributes.sowing_method}</p>
					</div>
				)}

				<button
					onClick={() => speakNepali(cropDetailMsg(crop, lang))}
					className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 rounded-xl w-full justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
				>
					<Volume2 size={16} />
					{lang === "ne" ? "जानकारी सुन्नुहोस्" : "Listen to Details"}
				</button>
			</div>
		</div>
	);
}