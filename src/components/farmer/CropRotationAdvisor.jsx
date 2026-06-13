"use client";
import { useState } from "react";
import { RefreshCw, Loader2, Sparkles, RotateCcw, Leaf, ArrowRight, Volume2 } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";
import { speakNepali } from "../../lib/speak";

export default function CropRotationAdvisor() {
	const { lang } = useLanguage();
	const [currentCrop, setCurrentCrop] = useState("");
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const crops = [
		{ name: "धान (Rice)", emoji: "🌾" },
		{ name: "मकै (Maize)", emoji: "🌽" },
		{ name: "गहुँ (Wheat)", emoji: "🌾" },
		{ name: "आलु (Potato)", emoji: "🥔" },
		{ name: "प्याज (Onion)", emoji: "🧅" },
		{ name: "टमाटर (Tomato)", emoji: "🍅" },
		{ name: "बन्दा (Cabbage)", emoji: "🥬" },
		{ name: "सिमी (Bean)", emoji: "🫘" },
		{ name: "तोरी (Mustard)", emoji: "🌱" },
		{ name: "मसुरो (Lentil)", emoji: "🫘" },
		{ name: "काँक्रो (Cucumber)", emoji: "🥒" },
		{ name: "फूलकोबी (Cauliflower)", emoji: "🥦" },
	];

	const getAdvice = async () => {
		if (!currentCrop.trim()) {
			setError(lang === "ne" ? "कृपया बाली चयन गर्नुहोस्" : "Please select a crop");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/crop-rotation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentCrop }),
			});
			const data = await res.json();
			setResult(data);
		} catch (err) {
			setError("Failed to get recommendations");
		}
		setLoading(false);
	};

	const speechText = result?.rotations
		? result.rotations.map((r) => `${r.crop_name}: ${lang === "ne" ? r.benefits_ne : r.benefits}`).join(". ")
		: "";

	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
			<div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-b border-purple-100 dark:border-purple-800">
				<div className="flex items-center gap-2 mb-2">
					<RotateCcw size={20} className="text-purple-600" />
					<h2 className="font-bold text-gray-900 dark:text-gray-100">
						{lang === "ne" ? "बाली चक्र सल्लाह" : "Crop Rotation Advisor"}
					</h2>
				</div>
				<p className="text-xs text-gray-500">
					{lang === "ne"
						? "हालको बाली चयन गर्नुहोस्, अर्को मौसमको लागि सिफारिस पाउनुहोस्"
						: "Select your current crop to get rotation recommendations"}
				</p>
			</div>

			<div className="p-4 space-y-4">
				{/* Quick select */}
				<div className="flex flex-wrap gap-2">
					{crops.map((c) => (
						<button
							key={c.name}
							onClick={() => { setCurrentCrop(c.name); setError(""); }}
							className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
								currentCrop === c.name
									? "bg-purple-600 text-white shadow-md"
									: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
							}`}
						>
							{c.emoji} {c.name.split("(")[1]?.split(")")[0] || c.name}
						</button>
					))}
				</div>

				{/* Show selected */}
				{currentCrop && (
					<div className="bg-gray-50 dark:bg-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
						<Leaf size={18} className="text-purple-600" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							{lang === "ne" ? "हाल: " : "Current: "}
							{currentCrop}
						</p>
					</div>
				)}

				{error && <p className="text-sm text-red-500">{error}</p>}

				<button
					onClick={getAdvice}
					disabled={loading || !currentCrop}
					className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? (
						<Loader2 className="animate-spin" size={18} />
					) : (
						<Sparkles size={18} />
					)}
					{loading
						? (lang === "ne" ? "सिफारिस हुँदै..." : "Getting advice...")
						: (lang === "ne" ? "सिफारिस हेर्नुहोस्" : "Get Recommendations")}
				</button>

				{/* Results */}
				{result?.rotations && (
					<div className="space-y-3 animate-slide-up">
						<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
							<ArrowRight size={12} />
							{lang === "ne" ? "सिफारिस गरिएको बाली चक्र" : "Recommended Crop Rotation"}
						</h3>
						{result.rotations.map((r, i) => (
							<div
								key={i}
								className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-3.5 border border-purple-100 dark:border-purple-800"
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<span className="text-2xl">{r.emoji || "🌱"}</span>
										<div>
											<p className="font-bold text-sm text-gray-900 dark:text-gray-100">{r.crop_name}</p>
											<p className="text-[10px] text-gray-400">{r.season}</p>
										</div>
									</div>
									<span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
										r.compatibility === "high" ? "bg-green-100 text-green-700" :
										r.compatibility === "medium" ? "bg-amber-100 text-amber-700" :
										"bg-red-100 text-red-700"
									}`}>
										{r.compatibility}
									</span>
								</div>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									{lang === "ne" ? r.benefits_ne : r.benefits}
								</p>
								<p className="text-[10px] text-gray-400 mt-1">
									{r.days_to_harvest ? `~${r.days_to_harvest} days to harvest` : ""}
								</p>
							</div>
						))}

						{result.advice && (
							<div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3.5 border border-gray-100 dark:border-slate-600">
								<p className="text-xs text-gray-600 dark:text-gray-400 italic">
									💡 {lang === "ne" ? result.advice_ne : result.advice}
								</p>
							</div>
						)}

						<button
							onClick={() => speakNepali(speechText)}
							className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
						>
							<Volume2 size={14} /> {lang === "ne" ? "सुन्नुहोस्" : "Listen"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}