"use client";
import { useState } from "react";
import { CalendarDays, Sun, Droplets, Thermometer, Leaf, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";

// Nepal crop calendar data
const CROP_CALENDAR = [
	{
		crop: "धान (Rice)",
		emoji: "🌾",
		seasons: [
			{ name: "मुख्य (Main)", plant: "June-July", harvest: "October-November", duration: "120-150 days", water: "High", temp: "25-35°C" },
			{ name: "व्यक्ति (Spring)", plant: "March-April", harvest: "July-August", duration: "100-120 days", water: "High", temp: "20-30°C" },
		],
	},
	{
		crop: "मकै (Maize)",
		emoji: "🌽",
		seasons: [
			{ name: "मुख्य (Main)", plant: "March-April", harvest: "July-August", duration: "100-120 days", water: "Medium", temp: "20-30°C" },
			{ name: "शरद (Autumn)", plant: "August-September", harvest: "November-December", duration: "90-110 days", water: "Medium", temp: "18-28°C" },
		],
	},
	{
		crop: "गहुँ (Wheat)",
		emoji: "🌾",
		seasons: [
			{ name: "हिउँद (Winter)", plant: "November-December", harvest: "April-May", duration: "120-150 days", water: "Medium", temp: "10-25°C" },
		],
	},
	{
		crop: "आलु (Potato)",
		emoji: "🥔",
		seasons: [
			{ name: "हिउँद (Winter)", plant: "October-November", harvest: "February-March", duration: "90-120 days", water: "Medium", temp: "15-25°C" },
			{ name: "बसन्त (Spring)", plant: "January-February", harvest: "April-May", duration: "80-100 days", water: "Medium", temp: "18-25°C" },
		],
	},
	{
		crop: "प्याज (Onion)",
		emoji: "🧅",
		seasons: [
			{ name: "मुख्य (Main)", plant: "October-November", harvest: "March-April", duration: "120-150 days", water: "Medium", temp: "15-25°C" },
		],
	},
	{
		crop: "टमाटर (Tomato)",
		emoji: "🍅",
		seasons: [
			{ name: "बसन्त (Spring)", plant: "February-March", harvest: "June-July", duration: "90-120 days", water: "Medium", temp: "20-30°C" },
			{ name: "शरद (Autumn)", plant: "August-September", harvest: "November-December", duration: "90-110 days", water: "Medium", temp: "18-28°C" },
		],
	},
	{
		crop: "बन्दा (Cabbage)",
		emoji: "🥬",
		seasons: [
			{ name: "शरद (Autumn)", plant: "August-September", harvest: "November-December", duration: "80-100 days", water: "High", temp: "10-20°C" },
			{ name: "हिउँद (Winter)", plant: "October-November", harvest: "January-February", duration: "90-110 days", water: "High", temp: "8-18°C" },
		],
	},
	{
		crop: "फूलकोबी (Cauliflower)",
		emoji: "🥦",
		seasons: [
			{ name: "शरद (Autumn)", plant: "July-August", harvest: "October-November", duration: "90-110 days", water: "High", temp: "15-25°C" },
			{ name: "हिउँद (Winter)", plant: "September-October", harvest: "December-January", duration: "100-120 days", water: "High", temp: "10-20°C" },
		],
	},
	{
		crop: "सिमी (Bean)",
		emoji: "🫘",
		seasons: [
			{ name: "बसन्त (Spring)", plant: "February-March", harvest: "May-June", duration: "80-100 days", water: "Medium", temp: "18-30°C" },
			{ name: "शरद (Autumn)", plant: "August-September", harvest: "October-November", duration: "70-90 days", water: "Medium", temp: "15-28°C" },
		],
	},
	{
		crop: "काँक्रो (Cucumber)",
		emoji: "🥒",
		seasons: [
			{ name: "बसन्त (Spring)", plant: "February-March", harvest: "May-June", duration: "60-80 days", water: "High", temp: "20-35°C" },
			{ name: "गृष्म (Summer)", plant: "May-June", harvest: "July-August", duration: "55-70 days", water: "High", temp: "25-35°C" },
		],
	},
	{
		crop: "तोरी (Mustard)",
		emoji: "🌱",
		seasons: [
			{ name: "हिउँद (Winter)", plant: "October-November", harvest: "February-March", duration: "100-120 days", water: "Low", temp: "10-25°C" },
		],
	},
	{
		crop: "मसुरो (Lentil)",
		emoji: "🫘",
		seasons: [
			{ name: "हिउँद (Winter)", plant: "October-November", harvest: "February-March", duration: "90-110 days", water: "Low", temp: "10-25°C" },
		],
	},
	{
		crop: "केरा (Banana)",
		emoji: "🍌",
		seasons: [
			{ name: "वर्षैभरि (Year-round)", plant: "Any time (best: March-June)", harvest: "10-14 months after planting", duration: "10-14 months", water: "High", temp: "20-35°C" },
		],
	},
	{
		crop: "सुन्तला (Orange)",
		emoji: "🍊",
		seasons: [
			{ name: "एक पटक (Once)", plant: "June-July (monsoon)", harvest: "3-4 years to first harvest", duration: "Perennial", water: "Medium", temp: "15-30°C" },
		],
	},
];

export default function PlantingCalendar({ lang }) {
	const [search, setSearch] = useState("");
	const [expanded, setExpanded] = useState(null);
	const [selectedSeason, setSelectedSeason] = useState("all");

	const now = new Date();
	const month = now.getMonth();

	const currentSeason = month >= 2 && month <= 4 ? "Spring" :
		month >= 5 && month <= 7 ? "Summer" :
		month >= 8 && month <= 10 ? "Autumn" : "Winter";

	const filteredCrops = CROP_CALENDAR.filter((c) =>
		c.crop.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
			<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 border-b border-green-100 dark:border-green-800">
				<div className="flex items-center gap-2 mb-3">
					<CalendarDays size={20} className="text-[var(--color-primary)]" />
					<h2 className="font-bold text-gray-900 dark:text-gray-100">
						{lang === "ne" ? "बाली रोप्ने क्यालेन्डर" : "Planting Calendar"}
					</h2>
				</div>
				<p className="text-xs text-gray-500 mb-3">
					{lang === "ne"
						? `हालको मौसम: ${currentSeason} — बाली अनुसार रोप्ने र काट्ने समय हेर्नुहोस्`
						: `Current season: ${currentSeason} — Check when to plant and harvest crops`}
				</p>
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={lang === "ne" ? "बाली खोज्नुहोस्..." : "Search crop..."}
					className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-green-500"
				/>
			</div>

			<div className="divide-y divide-gray-100 dark:divide-slate-700">
				{filteredCrops.map((crop, idx) => (
					<div key={idx}>
						<button
							onClick={() => setExpanded(expanded === idx ? null : idx)}
							className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
						>
							<div className="flex items-center gap-3">
								<span className="text-2xl">{crop.emoji}</span>
								<div className="text-left">
									<p className="font-bold text-sm text-gray-900 dark:text-gray-100">{crop.crop}</p>
									<p className="text-[10px] text-gray-400">{crop.seasons.length} season{crop.seasons.length > 1 ? "s" : ""}</p>
								</div>
							</div>
							{expanded === idx ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
						</button>

						{expanded === idx && (
							<div className="px-4 pb-4 space-y-3 animate-slide-down">
								{crop.seasons.map((season, si) => (
									<div key={si} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3.5 border border-green-100 dark:border-green-800">
										<p className="text-xs font-bold text-[var(--color-primary)] mb-2 uppercase tracking-wider">
											{season.name}
										</p>
										<div className="grid grid-cols-2 gap-2 text-xs">
											<div className="flex items-center gap-1.5">
												<Sun size={12} className="text-amber-500" />
												<span className="text-gray-500">Plant:</span>
												<span className="font-semibold text-gray-800 dark:text-gray-200">{season.plant}</span>
											</div>
											<div className="flex items-center gap-1.5">
												<Leaf size={12} className="text-green-500" />
												<span className="text-gray-500">Harvest:</span>
												<span className="font-semibold text-gray-800 dark:text-gray-200">{season.harvest}</span>
											</div>
											<div className="flex items-center gap-1.5">
												<CalendarDays size={12} className="text-blue-500" />
												<span className="text-gray-500">Duration:</span>
												<span className="font-semibold text-gray-800 dark:text-gray-200">{season.duration}</span>
											</div>
											<div className="flex items-center gap-1.5">
												<Thermometer size={12} className="text-red-500" />
												<span className="text-gray-500">Temp:</span>
												<span className="font-semibold text-gray-800 dark:text-gray-200">{season.temp}</span>
											</div>
											<div className="flex items-center gap-1.5 col-span-2">
												<Droplets size={12} className="text-blue-500" />
												<span className="text-gray-500">Water need:</span>
												<span className="font-semibold text-gray-800 dark:text-gray-200">{season.water}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>

			{filteredCrops.length === 0 && (
				<div className="p-8 text-center text-sm text-gray-400">
					{lang === "ne" ? "यो बाली फेला परेन" : "No crop found"}
				</div>
			)}
		</div>
	);
}