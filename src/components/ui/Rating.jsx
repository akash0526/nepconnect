"use client";
import { Star } from "lucide-react";

export function StarRating({ rating = 0, size = 16, onChange, interactive = false }) {
	const stars = [1, 2, 3, 4, 5];

	return (
		<div className="flex items-center gap-0.5">
			{stars.map((star) => (
				<button
					key={star}
					type={interactive ? "button" : undefined}
					onClick={interactive ? () => onChange?.(star) : undefined}
					disabled={!interactive}
					className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
				>
					<Star
						size={size}
						className={`transition-colors ${
							star <= rating
								? "fill-amber-400 text-amber-400"
								: "fill-gray-200 text-gray-200 dark:fill-slate-600 dark:text-slate-600"
						}`}
						strokeWidth={1.5}
					/>
				</button>
			))}
		</div>
	);
}

export function RatingDisplay({ avg, count, size = 14 }) {
	return (
		<div className="flex items-center gap-1.5">
			<StarRating rating={Math.round(avg)} size={size} />
			<span className="text-sm font-bold text-gray-700 dark:text-gray-300">
				{avg}
			</span>
			<span className="text-xs text-gray-400">
				({count})
			</span>
		</div>
	);
}