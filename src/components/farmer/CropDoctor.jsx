import { Camera, Volume2, X, Sparkles, Loader2 } from "lucide-react";
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
	if (!simplified) {
		return (
			<div className="bg-white rounded-2xl shadow p-5">
				<h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
					<Sparkles size={20} className="text-yellow-500" />{" "}
					{lang === "ne" ? "बाली जाँच" : "Crop Doctor"}
				</h2>
				<p className="text-sm text-gray-500 mb-3">
					{lang === "ne"
						? "पातको फोटो खिच्नुहोस्, रोगको तुरुन्त जानकारी पाउनुहोस्।"
						: "Take a photo of a leaf for instant disease detection."}
				</p>

				<div className="flex gap-2 mb-4">
					<label className="flex-1 bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold">
						<Camera size={18} /> {lang === "ne" ? "फोटो खिच्नुहोस्" : "Take Photo"}
						<input
							type="file"
							accept="image/*"
							capture="environment"
							onChange={(e) => onCapture(e.target.files[0])}
							className="hidden"
						/>
					</label>
					<label className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold">
						📁 {lang === "ne" ? "अपलोड" : "Upload"}
						<input
							type="file"
							accept="image/*"
							onChange={(e) => onCapture(e.target.files[0])}
							className="hidden"
						/>
					</label>
				</div>

				{leafImage && (
					<div className="relative inline-block">
						<img src={leafImage} className="w-full rounded-xl" alt="Leaf" />
						<button
							onClick={onClear}
							className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow"
						>
							<X size={16} />
						</button>
						<button
							onClick={onDiagnose}
							disabled={loading}
							className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-xl flex items-center gap-2 font-bold disabled:opacity-50"
						>
							{loading ? (
								<Loader2 className="animate-spin" size={16} />
							) : (
								<Sparkles size={16} />
							)}
							{loading
								? lang === "ne"
									? "जाँच हुदैँ..."
									: "Analyzing..."
								: lang === "ne"
									? "जाँच गर्नुहोस्"
									: "Diagnose"}
						</button>
					</div>
				)}
			</div>
		);
	}

	const { isHealthy, icon, title, messageNepali, steps } = simplified;
	const speechText = isHealthy
		? lang === "ne"
			? "तपाईंको बाली स्वस्थ छ।"
			: "Your crop is healthy."
		: lang === "ne"
			? `तपाईंको बालीमा ${messageNepali} यसको उपचार: ${steps.map((s) => s.text).join("। ")}`
			: `Your crop has ${messageNepali}. Treatment: ${steps.map((s) => s.text).join(", ")}`;

	return (
		<div
			className={`rounded-2xl shadow p-5 ${
				isHealthy ? "bg-green-50" : "bg-red-50"
			} text-center`}
		>
			<div className="text-6xl mb-4">{icon}</div>
			<h3 className="text-2xl font-bold text-gray-800">
				{lang === "ne"
					? isHealthy
						? "बाली स्वस्थ"
						: "रोग लागेको"
					: isHealthy
						? "Healthy"
						: "Disease Detected"}
			</h3>
			<p className="text-lg text-gray-600 mt-2">
				{lang === "ne" ? messageNepali : simplified.disease}
			</p>

			{!isHealthy && steps.length > 0 && (
				<div className="mt-4 space-y-3">
					{steps.map((step, i) => (
						<div
							key={i}
							className="bg-white rounded-xl p-3 flex items-center gap-3"
						>
							<span className="text-2xl">{step.icon}</span>
							<p className="text-sm text-left">{step.text}</p>
						</div>
					))}
				</div>
			)}

			<div className="mt-5 flex justify-center gap-3">
				<button
					onClick={() => speakNepali(speechText)}
					className="bg-white px-4 py-2 rounded-full shadow flex items-center gap-1"
				>
					<Volume2 size={18} /> {lang === "ne" ? "सुन्नुहोस्" : "Listen"}
				</button>
				<button
					onClick={onClear}
					className="bg-gray-200 px-4 py-2 rounded-full"
				>
					{lang === "ne" ? "फेरि फोटो खिच्नुहोस्" : "Take another photo"}
				</button>
			</div>
		</div>
	);
}
