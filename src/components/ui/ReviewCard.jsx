"use client";
import { Star, ThumbsUp, MessageCircle, ShieldCheck } from "lucide-react";

export function ReviewList({ reviews, avg, count }) {
	if (!reviews || reviews.length === 0) return null;

	return (
		<div className="space-y-3">
			{/* Summary */}
			{avg > 0 && (
				<div className="flex items-center gap-3 mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3.5 border border-amber-100 dark:border-amber-800">
					<div className="text-center">
						<p className="text-3xl font-black text-amber-700 dark:text-amber-300">{avg}</p>
						<div className="flex items-center gap-0.5 mt-0.5">
							{[1, 2, 3, 4, 5].map((s) => (
								<Star
									key={s}
									size={12}
									className={s <= Math.round(avg) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
								/>
							))}
						</div>
					</div>
					<div className="flex-1">
						<p className="text-xs font-bold text-amber-800 dark:text-amber-200">
							{count} review{count !== 1 ? "s" : ""}
						</p>
						<p className="text-[10px] text-amber-600 dark:text-amber-400">
							Seller rating from buyers
						</p>
					</div>
				</div>
			)}

			{/* Individual reviews */}
			{reviews.map((review) => (
				<div key={review.id} className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700">
					<div className="flex items-start justify-between mb-2">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
								{(review.reviewer_name || "A").charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-xs font-bold text-gray-800 dark:text-gray-200">
									{review.reviewer_name || "Anonymous"}
								</p>
								<div className="flex items-center gap-1 mt-0.5">
									{[1, 2, 3, 4, 5].map((s) => (
										<Star
											key={s}
											size={10}
											className={s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
										/>
									))}
								</div>
							</div>
						</div>
						{review.is_verified_purchase && (
							<ShieldCheck size={12} className="text-green-500" />
						)}
					</div>
					{review.comment && (
						<p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
							{review.comment}
						</p>
					)}
					<p className="text-[10px] text-gray-400 mt-1.5">
						{new Date(review.created_at).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>
			))}
		</div>
	);
}

export function ReviewForm({ listingId, sellerId, onSubmit }) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoverRating, setHoverRating] = useState(0);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (rating === 0) return;
		onSubmit?.({ listing_id: listingId, seller_id: sellerId, rating, comment });
		setRating(0);
		setComment("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rate this seller</p>

			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => setRating(star)}
						onMouseEnter={() => setHoverRating(star)}
						onMouseLeave={() => setHoverRating(0)}
						className="p-0.5 transition-transform hover:scale-110"
					>
						<Star
							size={24}
							className={`cursor-pointer transition-colors ${
								star <= (hoverRating || rating)
									? "fill-amber-400 text-amber-400"
									: "fill-gray-200 text-gray-200 dark:fill-slate-600 dark:text-slate-600"
							}`}
						/>
					</button>
				))}
			</div>

			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Write a review (optional)"
				rows={3}
				maxLength={500}
				className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 resize-none"
			/>

			<button
				type="submit"
				disabled={rating === 0}
				className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
			>
				Submit Review
			</button>
		</form>
	);
}