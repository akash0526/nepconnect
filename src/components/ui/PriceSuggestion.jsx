"use client";
import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";

export default function PriceSuggestion({ title, category, description, onPriceSelect }) {
	const { lang } = useLanguage();
	const [suggestion, setSuggestion] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const getSuggestion = async () => {
		if (!title) {
			setError(lang === "ne" ? "पहिले वस्तुको नाम राख्नुहोस्" : "Please add a title first");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/price-suggest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, category, description }),
			});
			const data = await res.json();
			if (data.fallback) {
				// Provide a simple estimate
				setSuggestion({
					suggested_price: null,
					price_range_low: null,
					price_range_high: null,
					confidence: "low",
					reasoning: "Price suggestion temporarily unavailable. Check similar listings for reference.",
					reasoning_ne: "मूल्य सुझाव अस्थायी रूपमा उपलब्ध छैन। सन्दर्भको लागि समान सूचीहरू जाँच गर्नुहोस्।",
				});
			} else {
				setSuggestion(data);
			}
		} catch (err) {
			setError("Failed to get price suggestion");
		}
		setLoading(false);
	};

	const confidenceIcon = {
		high: <TrendingUp size={14} className="text-green-500" />,
		medium: <Minus size={14} className="text-amber-500" />,
		low: <TrendingDown size={14} className="text-red-500" />,
	};

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={getSuggestion}
				disabled={loading}
				className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3.5 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50"
			>
				{loading ? (
					<Loader2 size={14} className="animate-spin" />
				) : (
					<Sparkles size={14} />
				)}
				{loading
					? (lang === "ne" ? "मूल्य हेर्दै..." : "Analyzing...")
					: (lang === "ne" ? "AI मूल्य सुझाव" : "AI Price Suggestion")}
			</button>

			{suggestion && (
				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5 border border-blue-100 dark:border-blue-800 animate-slide-up">
					{suggestion.suggested_price ? (
						<>
							<div className="flex items-center justify-between mb-2">
								<p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
									Suggested Price
								</p>
								<div className="flex items-center gap-1 text-xs">
									{confidenceIcon[suggestion.confidence]}
									<span className="text-gray-500 capitalize">{suggestion.confidence}</span>
								</div>
							</div>
							<p className="text-2xl font-black text-[var(--color-primary)]">
								NPR {suggestion.suggested_price?.toLocaleString()}
							</p>
							{suggestion.price_range_low && suggestion.price_range_high && (
								<p className="text-xs text-gray-500 mt-1">
									Range: NPR {suggestion.price_range_low.toLocaleString()} – {suggestion.price_range_high.toLocaleString()}
								</p>
							)}
						</>
					) : (
						<div className="flex items-center gap-2">
							<DollarSign size={16} className="text-blue-500" />
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{lang === "ne" ? suggestion.reasoning_ne : suggestion.reasoning}
							</p>
						</div>
					)}

					{suggestion.reasoning && (
						<p className="text-[11px] text-gray-500 mt-2 italic">
							💡 {lang === "ne" ? suggestion.reasoning_ne : suggestion.reasoning}
						</p>
					)}

					{suggestion.suggested_price && onPriceSelect && (
						<button
							type="button"
							onClick={() => onPriceSelect(suggestion.suggested_price)}
							className="mt-2 text-xs font-bold text-blue-600 hover:underline"
						>
							{lang === "ne" ? "यो मूल्य प्रयोग गर्नुहोस्" : "Use this price"}
						</button>
					)}
				</div>
			)}

			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}