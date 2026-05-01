import { Volume2 } from "lucide-react";
import { speakNepali } from "../../lib/speak";

export default function WeatherWidget({ simple, lang }) {
	if (!simple) return null;

	const tempFeel =
		simple.temp > 30 ? "गर्मी" : simple.temp < 10 ? "चिसो" : "सामान्य";
	const rainMsg =
		simple.rain > 10
			? lang === "ne"
				? "धेरै पानी पर्ने"
				: "heavy rain"
			: simple.rain > 2
				? lang === "ne"
					? "पानी पर्न सक्ने"
					: "possible rain"
				: lang === "ne"
					? "पानी पर्ने सम्भावना कम"
					: "low rain chance";

	const speechText =
		lang === "ne"
			? `आजको मौसम: ${simple.mainIcon === "☀️" ? "घाम लाग्ने" : "पानी पर्ने"}, तापक्रम ${simple.temp} डिग्री, ${rainMsg}।`
			: `Today's weather: ${simple.mainIcon === "☀️" ? "sunny" : "rainy"}, temperature ${simple.temp} degrees, ${rainMsg}.`;

	return (
		<div className={`rounded-2xl shadow p-5 ${simple.bgColor} border`}>
			<div className="flex items-center justify-between mb-4">
				<h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
					☀️ {lang === "ne" ? "हाम्रो मौसम" : "Our Weather"}
				</h2>
				<button
					onClick={() => speakNepali(speechText)}
					className="p-2 bg-white/70 rounded-full shadow"
				>
					<Volume2 size={20} className="text-gray-700" />
				</button>
			</div>

			<div className="flex items-center gap-6">
				<div className="text-6xl">{simple.mainIcon}</div>
				<div>
					<div className="text-3xl font-bold text-gray-900">
						{simple.temp}°C
					</div>
					<div className="text-sm text-gray-600">
						{lang === "ne" ? `${tempFeel} दिन` : `${tempFeel} day`}
					</div>
					<div className="text-xs text-gray-500 mt-1">{rainMsg}</div>
				</div>
			</div>

			<div className="mt-6 flex justify-between gap-2">
				{simple.forecast.map((f, idx) => (
					<div
						key={idx}
						className="bg-white/80 rounded-xl p-2 text-center flex-1"
					>
						<div className="text-xs font-medium text-gray-600">{f.day}</div>
						<div className="text-2xl my-1">{f.icon}</div>
						<div className="text-xs font-semibold">{f.temp}°</div>
						<div className="text-[10px] text-gray-500">{f.rain}mm</div>
					</div>
				))}
			</div>
		</div>
	);
}
