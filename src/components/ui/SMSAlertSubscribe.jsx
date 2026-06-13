"use client";
import { useState } from "react";
import { Bell, BellOff, Loader2, Smartphone, CheckCircle2, Phone, X } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";

const ALERT_TYPES = [
	{ id: "weather", emoji: "🌤️", label: "Weather", labelNe: "मौसम" },
	{ id: "planting", emoji: "🌱", label: "Planting Reminders", labelNe: "रोप्ने सम्झना" },
	{ id: "market", emoji: "📊", label: "Market Prices", labelNe: "बजार मूल्य" },
	{ id: "harvest", emoji: "🌾", label: "Harvest Alerts", labelNe: "कटनी सूचना" },
];

export default function SMSAlertSubscribe() {
	const { lang } = useLanguage();
	const [phone, setPhone] = useState("");
	const [selectedAlerts, setSelectedAlerts] = useState(["weather", "planting"]);
	const [subscribed, setSubscribed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [show, setShow] = useState(true);

	const toggleAlert = (id) => {
		setSelectedAlerts((prev) =>
			prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
		);
	};

	const subscribe = async () => {
		if (!phone || phone.length < 10) {
			setError(lang === "ne" ? "मान्य फोन नम्बर राख्नुहोस्" : "Enter a valid phone number");
			return;
		}
		if (selectedAlerts.length === 0) {
			setError(lang === "ne" ? "कम्तीमा एउटा सूचना चयन गर्नुहोस्" : "Select at least one alert");
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Send a welcome SMS to confirm subscription
			await fetch("/api/sms-alert", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone,
					type: "subscription",
					message: `Namaste! Tapai NepConnect SMS suchana ma abhinapt khateko. ${selectedAlerts.map((a) => ALERT_TYPES.find((t) => t.id === a)?.emoji).join(" ")} - NepConnect`,
				}),
			});

			setSubscribed(true);
			// Save to localStorage
			localStorage.setItem("nepconnect_sms_phone", phone);
			localStorage.setItem("nepconnect_sms_alerts", JSON.stringify(selectedAlerts));
		} catch (err) {
			setError(lang === "ne" ? "सदस्यता लिँदा समस्या" : "Subscription failed");
		}
		setLoading(false);
	};

	if (subscribed) {
		return (
			<div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800 animate-slide-up">
				<div className="flex items-center gap-3">
					<CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
					<div>
						<p className="font-bold text-sm text-green-800 dark:text-green-200">
							{lang === "ne" ? "सफलतापूर्वक अभिनत!" : "Subscribed Successfully!"}
						</p>
						<p className="text-xs text-green-600 dark:text-green-400">
							{lang === "ne" ? `SMS सूचनाहरू ${phone} मा पठाइनेछ` : `SMS alerts will be sent to ${phone}`}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!show) return null;

	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Smartphone size={18} className="text-blue-600" />
					<h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
						{lang === "ne" ? "SMS सूचना" : "SMS Alerts"}
					</h3>
				</div>
				<button onClick={() => setShow(false)} className="text-gray-300 hover:text-gray-500 p-1">
					<X size={14} />
				</button>
			</div>

			<div className="p-4 space-y-4">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					{lang === "ne"
						? "नेटवर्क नभएको बेला SMS मा मौसम, बाली र बजार जानकारी पाउनुहोस्।"
						: "Get weather, crop, and market info via SMS even without internet."}
				</p>

				{/* Phone input */}
				<div className="relative">
					<Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="98XXXXXXXX"
						maxLength={10}
						className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				{/* Alert types */}
				<div className="flex flex-wrap gap-2">
					{ALERT_TYPES.map((alert) => {
						const selected = selectedAlerts.includes(alert.id);
						return (
							<button
								key={alert.id}
								type="button"
								onClick={() => toggleAlert(alert.id)}
								className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
									selected
										? "bg-blue-600 text-white shadow-sm"
										: "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
								}`}
							>
								{alert.emoji} {lang === "ne" ? alert.labelNe : alert.label}
							</button>
						);
					})}
				</div>

				<button
					type="button"
					onClick={subscribe}
					disabled={loading}
					className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
				>
					{loading ? (
						<Loader2 className="animate-spin" size={18} />
					) : (
						<Bell size={18} />
					)}
					{loading
						? (lang === "ne" ? "अभिनत हुँदै..." : "Subscribing...")
						: (lang === "ne" ? "नि:शुल्क अभिनत हुनुहोस्" : "Subscribe Free")}
				</button>

				<p className="text-[10px] text-gray-400 text-center">
					{lang === "ne" ? "जुनसुकै बेला सदस्यता रद्द गर्न सकिन्छ" : "You can unsubscribe anytime"}
				</p>

				{error && <p className="text-xs text-red-500">{error}</p>}
			</div>
		</div>
	);
}