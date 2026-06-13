"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import {
	Loader2, Cloud, MapPin, Sparkles, ArrowLeft, Monitor, Sun,
	Droplets, Thermometer, ScrollText, Camera, Volume2, X, Search,
	Leaf, Menu as MenuIcon, CalendarDays, RotateCcw, BarChart3,
	Smartphone, Mic, MicOff, ChevronDown, ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";
import { useWeather } from "../../hooks/useWeather";
import { useCrops } from "../../hooks/useCrops";
import { useDiagnosis } from "../../hooks/useDiagnosis";
import { speakNepali } from "../../lib/speak";
import WeatherWidget from "../../components/farmer/WeatherWidget";
import CropGuide from "../../components/farmer/CropGuide";
import CropDoctor from "../../components/farmer/CropDoctor";
import PlantingCalendar from "../../components/farmer/PlantingCalendar";
import CropRotationAdvisor from "../../components/farmer/CropRotationAdvisor";
import NepaliVoiceInput from "../../components/ui/NepaliVoiceInput";
import SMSAlertSubscribe from "../../components/ui/SMSAlertSubscribe";

const TABS = [
	{ id: "weather", label: "Weather", icon: Cloud, color: "from-blue-500 to-cyan-500" },
	{ id: "crops", label: "Crops", icon: Leaf, color: "from-green-500 to-emerald-500" },
	{ id: "doctor", label: "Doctor", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
	{ id: "calendar", label: "Calendar", icon: CalendarDays, color: "from-purple-500 to-indigo-500" },
	{ id: "rotation", label: "Rotation", icon: RotateCcw, color: "from-rose-500 to-pink-500" },
	{ id: "tools", label: "Tools", icon: Smartphone, color: "from-teal-500 to-cyan-500" },
];

export default function FarmerHub() {
	const [activeTab, setActiveTab] = useState("weather");
	const [showCropPicker, setShowCropPicker] = useState(false);
	const { lang } = useLanguage();
	const weatherTools = useWeather();
	const cropTools = useCrops();
	const diagnosisTools = useDiagnosis();

	return (
		<div className="pb-24">
			{/* Header */}
			<div className="bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
						🌾 {lang === "ne" ? "किसान हब" : "Farmer Hub"}
					</h1>
					<p className="text-sm text-white/80 font-medium mt-1">
						{lang === "ne"
							? "मौसम, बाली रोग, बाली जानकारी, रोप्ने क्यालेन्डर, र थप"
							: "Weather, crops, disease detection, planting calendar & more"}
					</p>
				</div>
			</div>

			{/* Quick Market Price Link */}
			<Link
				href="/market-prices"
				className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 mb-5 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
			>
				<div className="flex items-center gap-3">
					<BarChart3 size={24} />
					<div>
						<p className="font-bold text-sm">{lang === "ne" ? "बजार मूल्य हेर्नुहोस्" : "Check Market Prices"}</p>
						<p className="text-xs text-white/80">{lang === "ne" ? "तरकारी, फलफूल, अन्नको मूल्य" : "Vegetables, fruits, grains prices"}</p>
					</div>
				</div>
				<ChevronRight size={20} />
			</Link>

			{/* Tabs */}
			<div className="bg-white dark:bg-slate-800 rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm border border-gray-100 dark:border-slate-700 overflow-x-auto hide-scrollbar">
				{TABS.map((tab) => {
					const isActive = activeTab === tab.id;
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex-1 min-w-[60px] flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
								isActive
									? `bg-gradient-to-br ${tab.color} text-white shadow-md`
									: "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
							}`}
						>
							<Icon size={14} />
							<span className="hidden sm:inline">{tab.label}</span>
						</button>
					);
				})}
			</div>

			{/* Tab Content */}
			{activeTab === "weather" && (
				<div className="animate-fade-in space-y-4">
					<WeatherSection weatherTools={weatherTools} lang={lang} />
				</div>
			)}

			{activeTab === "crops" && (
				<div className="animate-fade-in space-y-4">
					<CropSection cropTools={cropTools} lang={lang} showCropPicker={showCropPicker} setShowCropPicker={setShowCropPicker} />
				</div>
			)}

			{activeTab === "doctor" && (
				<div className="animate-fade-in space-y-4">
					<CropDoctorSection diagnosisTools={diagnosisTools} lang={lang} />
				</div>
			)}

			{activeTab === "calendar" && (
				<div className="animate-fade-in space-y-4">
					<PlantingCalendar lang={lang} />
				</div>
			)}

			{activeTab === "rotation" && (
				<div className="animate-fade-in space-y-4">
					<CropRotationAdvisor />
				</div>
			)}

			{activeTab === "tools" && (
				<div className="animate-fade-in space-y-4">
					<NepaliVoiceSection lang={lang} />
					<SMSAlertSubscribe />
				</div>
			)}
		</div>
	);
}

function WeatherSection({ weatherTools, lang }) {
	const { fetchWeather, loading, error, simpleWeather } = weatherTools;
	return (
		<>
			<div className="card p-4">
				<div className="flex items-center justify-between mb-3">
					<h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Sun size={18} className="text-amber-500" />
						{lang === "ne" ? "मौसम जानकारी" : "Weather Info"}
					</h2>
					<button onClick={fetchWeather} disabled={loading}
						className="flex items-center gap-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-green-200 transition disabled:opacity-50">
						{loading ? <Loader2 className="animate-spin" size={14} /> : <Cloud size={14} />}
						{loading ? (lang === "ne" ? "लोड..." : "Loading...") : (lang === "ne" ? "हेर्नुहोस्" : "Check Now")}
					</button>
				</div>
				<p className="text-xs text-gray-500">{lang === "ne" ? "काठमाडौंको मौसम जानकारी हेर्नुहोस्" : "Check current weather for Kathmandu"}</p>
			</div>
			{error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
			{simpleWeather && <WeatherWidget simple={simpleWeather} lang={lang} />}
		</>
	);
}

function CropSection({ cropTools, lang, showCropPicker, setShowCropPicker }) {
	const { search, setSearch, searchCrops, results, selectedCrop, loading, getCropDetails, clearCrop } = cropTools;
	return (
		<>
			<div className="card p-4">
				<h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
					<Leaf size={18} className="text-green-600" />
					{lang === "ne" ? "बाली खोज्नुहोस्" : "Crop Guide"}
				</h2>
				<div className="flex gap-2">
					<input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
						placeholder={lang === "ne" ? "बालीको नाम..." : "Search crop..."}
						className="input-field flex-1" onKeyDown={(e) => e.key === "Enter" && searchCrops()} />
					<button onClick={searchCrops} disabled={loading || !search.trim()}
						className="bg-[var(--color-primary)] text-white px-4 rounded-xl disabled:opacity-50 hover:bg-[var(--color-primary-dark)] transition">
						{loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
					</button>
				</div>
				<button onClick={() => setShowCropPicker(!showCropPicker)}
					className="mt-3 text-xs text-[var(--color-primary)] font-semibold flex items-center gap-1 hover:underline">
					🌱 {lang === "ne" ? "लोकप्रिय बालीहरू" : "Popular Crops"} {showCropPicker ? "▲" : "▼"}
				</button>
				{showCropPicker && (
					<div className="mt-3 grid grid-cols-2 gap-2 animate-slide-down">
						{[
							{ name: "धान (Rice)", emoji: "🌾", query: "rice" },
							{ name: "मकै (Maize)", emoji: "🌽", query: "maize" },
							{ name: "गहुँ (Wheat)", emoji: "🌾", query: "wheat" },
							{ name: "आलु (Potato)", emoji: "🥔", query: "potato" },
							{ name: "प्याज (Onion)", emoji: "🧅", query: "onion" },
							{ name: "टमाटर (Tomato)", emoji: "🍅", query: "tomato" },
							{ name: "बन्दा (Cabbage)", emoji: "🥬", query: "cabbage" },
							{ name: "सिमी (Bean)", emoji: "🫘", query: "bean" },
							{ name: "तोरी (Mustard)", emoji: "🌱", query: "mustard" },
							{ name: "मसुरो (Lentil)", emoji: "🫘", query: "lentil" },
							{ name: "काँक्रो (Cucumber)", emoji: "🥒", query: "cucumber" },
							{ name: "फूलकोबी (Cauliflower)", emoji: "🥦", query: "cauliflower" },
						].map((crop) => (
							<button key={crop.query} onClick={() => { setSearch(crop.query); setShowCropPicker(false); setTimeout(() => searchCrops(), 100); }}
								className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-2 rounded-xl text-xs font-medium text-left transition">
								<span className="text-lg">{crop.emoji}</span>
								<span className="text-gray-700 dark:text-gray-300">{crop.name}</span>
							</button>
						))}
					</div>
				)}
			</div>
			{results.length > 0 && !selectedCrop && (
				<div className="card p-4 animate-slide-up">
					<h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{lang === "ne" ? "खोज परिणाम" : "Results"}</h3>
					<div className="space-y-1 max-h-60 overflow-y-auto">
						{results.map((crop) => (
							<button key={crop.id} onClick={() => getCropDetails(crop)}
								className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition flex items-center gap-3">
								<Leaf size={14} className="text-green-500" /> {crop.attributes?.name}
							</button>
						))}
					</div>
				</div>
			)}
			{selectedCrop && <CropGuide lang={lang} selectedCrop={selectedCrop} onClear={clearCrop} />}
			{!selectedCrop && results.length === 0 && !search && (
				<div className="card p-4 text-center text-gray-500 dark:text-gray-400">
					🌱 <p className="text-sm mt-1">{lang === "ne" ? "माथि बाली खोज्नुहोस्" : "Search for a crop above"}</p>
				</div>
			)}
		</>
	);
}

function CropDoctorSection({ diagnosisTools, lang }) {
	const { simplifiedDiagnosis, loading, handleLeafCapture, runDiagnosis, clear, leafImage } = diagnosisTools;
	return (
		<CropDoctor
			simplified={simplifiedDiagnosis}
			loading={loading}
			onCapture={handleLeafCapture}
			onDiagnose={runDiagnosis}
			onClear={clear}
			leafImage={leafImage}
			lang={lang}
		/>
	);
}

function NepaliVoiceSection({ lang }) {
	const [voiceText, setVoiceText] = useState("");

	const handleVoiceResult = (text) => {
		setVoiceText(text);
	};

	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
			<div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 border-b border-teal-100 dark:border-teal-800">
				<div className="flex items-center gap-2">
					<Mic size={18} className="text-teal-600" />
					<h2 className="font-bold text-gray-900 dark:text-gray-100">
						{lang === "ne" ? "भ्वाइस इनपुट" : "Voice Input"}
					</h2>
				</div>
				<p className="text-xs text-gray-500 mt-1">
					{lang === "ne"
						? "नेपालीमा बोल्नुहोस्, टाइप गर्न आवश्यक छैन"
						: "Speak in Nepali — no typing needed"}
				</p>
			</div>
			<div className="p-4">
				<NepaliVoiceInput
					onResult={handleVoiceResult}
					label=""
					language="ne-NP"
					placeholder="नेपालीमा बोल्नुहोस्..."
				/>
				{voiceText && (
					<div className="mt-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3.5 border border-teal-200 dark:border-teal-800">
						<p className="text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">
							{lang === "ne" ? "तपाईंले भन्नुभयो:" : "You said:"}
						</p>
						<p className="text-sm text-gray-700 dark:text-gray-300">{voiceText}</p>
						<div className="flex gap-2 mt-3">
							<button onClick={() => { setVoiceText(""); }}
								className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">
								{lang === "ne" ? "मेटाउनुहोस्" : "Clear"}
							</button>
							<button onClick={() => speakNepali(voiceText)}
								className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-xl hover:bg-teal-200 transition flex items-center gap-1">
								<Volume2 size={12} /> {lang === "ne" ? "सुन्नुहोस्" : "Play"}
							</button>
						</div>
					</div>
				)}
			</div>
			<div className="bg-teal-50/50 dark:bg-teal-900/10 px-4 py-3 border-t border-teal-100 dark:border-teal-800">
				<p className="text-[10px] text-teal-600 dark:text-teal-400">
					💡 {lang === "ne" ? "बाली, मौसम, वा रोगको बारेमा बोल्नुहोस्" : "Try: talk about crops, weather, or diseases"}
				</p>
			</div>
		</div>
	);
}