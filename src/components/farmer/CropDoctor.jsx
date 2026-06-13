import { Camera, Volume2, X, Sparkles, Loader2, Upload, Leaf, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { speakNepali } from "../../lib/speak";

export default function CropDoctor({
	simplified,
	loading,
	onCapture,
	onDiagnose,
	onClear,
	leafImage,
	lang,
}) {
	if (simplified) {
		const { isHealthy, icon, title, messageNepali, steps } = simplified;

		const speechText = isHealthy
			? lang === "ne" ? "तपाईंको बाली स्वस्थ छ।" : "Your crop is healthy."
			: lang === "ne"
				? `तपाईंको बालीमा ${messageNepali} यसको उपचार: ${steps.map((s) => s.text).join("। ")}`
				: `Your crop has issue. Treatment: ${steps.map((s) => s.text).join(", ")}`;

		return (
			<div className={`rounded-2xl shadow-md overflow-hidden border ${isHealthy ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800" : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800"}`}>
				<div className="p-5 text-center">
					<div className="text-6xl mb-4">{isHealthy ? "🟢" : "🔴"}</div>
					<h3 className={`text-xl font-black ${isHealthy ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
						{lang === "ne" ? (isHealthy ? "बाली स्वस्थ ✅" : "रोग लागेको") : isHealthy ? "Healthy Crop ✅" : "Disease Detected"}
					</h3>
					<p className={`text-sm mt-2 ${isHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
						{lang === "ne" ? messageNepali : (simplified.disease || (isHealthy ? "No issues found" : "Disease detected"))}
					</p>

					{!isHealthy && steps && steps.length > 0 && (
						<div className="mt-5 space-y-3 text-left">
							<p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
								<Lightbulb size={14} className="text-amber-500" />
								{lang === "ne" ? "उपचार" : "Treatment Steps"}
							</p>
							{steps.map((step, i) => (
								<div key={i} className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
									<span className="text-2xl">{step.icon || "✅"}</span>
									<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step.text}</p>
								</div>
							))}
						</div>
					)}

					<div className="mt-6 flex justify-center gap-3">
						<button
							onClick={() => speakNepali(speechText)}
							className="flex items-center gap-1.5 bg-white dark:bg-slate-700 px-4 py-2.5 rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-gray-300 hover:shadow transition"
						>
							<Volume2 size={16} />
							{lang === "ne" ? "सुन्नुहोस्" : "Listen"}
						</button>
						<button
							onClick={onClear}
							className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition"
						>
							<Camera size={16} />
							{lang === "ne" ? "फेरि" : "Another"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
			<div className="p-5">
				<h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
					<Sparkles size={20} className="text-yellow-500" />
					{lang === "ne" ? "बाली डाक्टर" : "Crop Doctor"}
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
					{lang === "ne"
						? "पातको फोटो खिच्नुहोस्, रोगको तुरुन्त जानकारी पाउनुहोस्।"
						: "Take a photo of a leaf for instant disease detection."}
				</p>

				{/* Photo / Upload buttons */}
				<div className="grid grid-cols-2 gap-3 mb-4">
					<label className="flex flex-col items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white py-5 rounded-2xl cursor-pointer font-bold hover:shadow-lg hover:shadow-green-200 active:scale-[0.98] transition-all">
						<Camera size={28} />
						<span className="text-xs">{lang === "ne" ? "फोटो खिच्नुहोस्" : "Take Photo"}</span>
						<input
							type="file"
							accept="image/*"
							capture="environment"
							onChange={(e) => onCapture(e.target.files[0])}
							className="hidden"
						/>
					</label>
					<label className="flex flex-col items-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-5 rounded-2xl cursor-pointer font-bold hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all">
						<Upload size={28} />
						<span className="text-xs">{lang === "ne" ? "अपलोड" : "Upload"}</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => onCapture(e.target.files[0])}
							className="hidden"
						/>
					</label>
				</div>

				{/* Preview */}
				{leafImage && (
					<div className="animate-slide-up">
						<div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-slate-600">
							<img src={leafImage} className="w-full h-56 object-cover" alt="Leaf" />
							<button
								onClick={onClear}
								className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition"
							>
								<X size={16} />
							</button>
						</div>
						<button
							onClick={onDiagnose}
							disabled={loading}
							className="mt-3 w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<>
									<Loader2 className="animate-spin" size={18} />
									{lang === "ne" ? "जाँच हुदैँ..." : "Analyzing..."}
								</>
							) : (
								<>
									<Sparkles size={18} />
									{lang === "ne" ? "जाँच गर्नुहोस्" : "Diagnose"}
								</>
							)}
						</button>
						<p className="text-center text-[11px] text-gray-400 mt-2">
							{lang === "ne"
								? "AI ले फोटो विश्लेषण गर्नेछ"
								: "AI will analyze the image"}
						</p>
					</div>
				)}

				{!leafImage && (
					<div className="text-center py-8 text-gray-400 dark:text-gray-500">
						<Leaf size={40} className="mx-auto mb-3 opacity-50" />
						<p className="text-sm">{lang === "ne" ? "फोटो लिनुहोस् वा अपलोड गर्नुहोस्" : "Take or upload a photo to start"}</p>
					</div>
				)}
			</div>

			{/* Bottom tip */}
			<div className="bg-amber-50 dark:bg-amber-900/20 px-5 py-3 border-t border-amber-100 dark:border-amber-800">
				<p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium">
					<AlertTriangle size={12} />
					{lang === "ne"
						? "स्वस्थ पातको फोटो राम्रो हुन्छ"
						: "Clear leaf photos give better results"}
				</p>
			</div>
		</div>
	);
}