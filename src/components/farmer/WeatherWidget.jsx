import { Volume2, Sun, Cloud, Droplets, Thermometer } from "lucide-react";
import { speakNepali } from "../../lib/speak";

export default function WeatherWidget({ simple, lang }) {
	if (!simple) return null;

	const tempFeel =
		simple.temp > 30 ? (lang === "ne" ? "गर्मी" : "Hot") :
		simple.temp < 10 ? (lang === "ne" ? "चिसो" : "Cold") :
		(lang === "ne" ? "सामान्य" : "Mild");

	const rainMsg =
		simple.rain > 10
			? lang === "ne" ? "धेरै पानी पर्ने" : "Heavy rain"
			: simple.rain > 2
				? lang === "ne" ? "पानी पर्न सक्ने" : "Possible rain"
				: lang === "ne" ? "पानी पर्ने सम्भावना कम" : "Low rain chance";

	const speechText =
		lang === "ne"
			? `आजको मौसम: तापक्रम ${simple.temp} डिग्री, ${rainMsg}।`
			: `Today's weather: temperature ${simple.temp} degrees, ${rainMsg}.`;

	return (
		<div className={`rounded-2xl shadow-md overflow-hidden border ${simple.bgColor || "bg-white"} dark:bg-slate-800 dark:border-slate-700`}>
			<div className="p-5">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Sun size={18} className="text-amber-500" />
						{lang === "ne" ? "मौसम" : "Weather"}
					</h2>
					<button
						onClick={() => speakNepali(speechText)}
						className="p-2 bg-white/70 dark:bg-slate-700 rounded-full shadow-sm hover:bg-white transition"
						title={lang === "ne" ? "सुन्नुहोस्" : "Listen"}
					>
						<Volume2 size={18} className="text-gray-600 dark:text-gray-300" />
					</button>
				</div>

				<div className="flex items-center gap-6">
					<div className="text-6xl">{simple.mainIcon}</div>
					<div>
						<div className="text-3xl font-black text-gray-900 dark:text-gray-100">
							{Math.round(simple.temp)}°C
						</div>
						<div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
							<Thermometer size={14} />
							{tempFeel}
						</div>
						<div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							<Droplets size={12} />
							{rainMsg}
						</div>
					</div>
				</div>

				{simple.forecast && simple.forecast.length > 0 && (
					<>
						<div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
							<p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
								{lang === "ne" ? "४ दिने पूर्वानुमान" : "4-Day Forecast"}
							</p>
							<div className="flex justify-between gap-2">
								{simple.forecast.map((f, idx) => (
									<div
										key={idx}
										className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-2.5 text-center flex-1"
									>
										<div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
											{f.day}
										</div>
										<div className="text-2xl my-1">{f.icon}</div>
										<div className="text-sm font-bold text-gray-800 dark:text-gray-200">
											{Math.round(f.temp)}°
										</div>
										<div className="text-[10px] text-gray-400">
											{f.rain ? `${f.rain}mm` : "---"}
										</div>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			{/* Bottom tip */}
			<div className="bg-black/5 dark:bg-white/5 px-5 py-3">
				<p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
					<Cloud size={12} />
					{lang === "ne"
						? "बाली लगाउनु अघि मौसम जाँच गर्नुहोस्"
						: "Check weather before planting"}
				</p>
			</div>
		</div>
	);
}