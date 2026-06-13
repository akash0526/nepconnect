"use client";
import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, Play, Square } from "lucide-react";
import { speakNepali } from "../../lib/speak";

export default function NepaliVoiceInput({
	onResult,
	placeholder = "Tap mic and speak in Nepali...",
	label = "Voice Input",
	language = "ne-NP",
}) {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [error, setError] = useState("");
	const [isSupported, setIsSupported] = useState(true);
	const recognitionRef = useRef(null);

	// Check if SpeechRecognition is supported
	const checkSupport = useCallback(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			setIsSupported(false);
			setError("Voice input is not supported in this browser");
			return false;
		}
		return true;
	}, []);

	const startListening = () => {
		if (!checkSupport()) return;

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new SpeechRecognition();

		recognition.lang = language; // 'ne-NP' for Nepali, 'en-US' for English
		recognition.continuous = false;
		recognition.interimResults = true;
		recognition.maxAlternatives = 5;

		recognition.onstart = () => {
			setIsListening(true);
			setError("");
			setTranscript("");
		};

		recognition.onresult = (event) => {
			let finalTranscript = "";
			let interimTranscript = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					finalTranscript += result[0].transcript;
				} else {
					interimTranscript += result[0].transcript;
				}
			}

			const text = finalTranscript || interimTranscript;
			setTranscript(text);
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setError(getErrorMessage(event.error, language));
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
			// If we got a result, pass it back
			if (transcript && onResult) {
				onResult(transcript);
			}
		};

		recognitionRef.current = recognition;
		recognition.start();
	};

	const stopListening = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setIsListening(false);
		}
	};

	const toggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	};

	const getErrorMessage = (errorCode, lang) => {
		if (lang === "ne-NP") {
			const messages = {
				"no-speech": "कुनै आवाज सुनिएन। कृपया फेरि प्रयास गर्नुहोस्।",
				"audio-capture": "माइक्रोफोन फेला परेन।",
				"not-allowed": "माइक्रोफोन अनुमति आवश्यक छ।",
				"network": "नेटवर्क समस्या। कृपया पछि प्रयास गर्नुहोस्।",
				"aborted": "रद्द गरियो।",
				"language-not-supported": "यो भाषा समर्थित छैन।",
			};
			return messages[errorCode] || "भ्वाइस इनपुटमा समस्या भयो।";
		}
		const messages = {
			"no-speech": "No speech detected. Please try again.",
			"audio-capture": "No microphone found.",
			"not-allowed": "Microphone permission is required.",
			network: "Network error. Please try again.",
			aborted: "Cancelled.",
			"language-not-supported": "Language not supported.",
		};
		return messages[errorCode] || "Voice input error.";
	};

	if (!isSupported) {
		return null; // Hide component if not supported
	}

	return (
		<div className="flex flex-col gap-2">
			{label && (
				<p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
					<Mic size={12} /> {label}
				</p>
			)}

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={toggleListening}
					className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
						isListening
							? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200"
							: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600"
					}`}
					title={isListening ? "Tap to stop" : "Tap and speak"}
				>
					{isListening ? <MicOff size={16} /> : <Mic size={16} />}
					{isListening
						? (language === "ne-NP" ? "सुन्दै..." : "Listening...")
						: (language === "ne-NP" ? "बोल्नुहोस्" : "Tap to Speak")}
				</button>

				{transcript && (
					<button
						type="button"
						onClick={() => speakNepali(transcript)}
						className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition"
						title="Play back"
					>
						<Volume2 size={16} />
					</button>
				)}
			</div>

			{/* Show transcript */}
			{transcript && (
				<div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl p-3">
					<p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
					<div className="flex items-center justify-between mt-2">
						<p className="text-[10px] text-gray-400">
							{language === "ne-NP" ? "नेपाली" : "Nepali"} detected
						</p>
						<button
							type="button"
							onClick={() => {
								if (onResult) onResult(transcript);
							}}
							className="text-[10px] font-bold text-[var(--color-primary)] hover:underline"
						>
							{language === "ne-NP" ? "प्रयोग गर्नुहोस्" : "Use this"}
						</button>
					</div>
				</div>
			)}

			{error && (
				<p className="text-xs text-red-500 flex items-center gap-1">
					<MicOff size={12} /> {error}
				</p>
			)}
		</div>
	);
}