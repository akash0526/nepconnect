/**
 * speak.js – Browser Speech Synthesis for Nepali
 * Works on Android (Chrome) with Google TTS engine and Nepali voice installed.
 * Falls back silently if speech is not supported.
 */

export function speakNepali(text) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;

	// Cancel any ongoing speech
	window.speechSynthesis.cancel();

	// Wait for voices to be available, then pick a Nepali voice
	const trySpeak = () => {
		const voices = window.speechSynthesis.getVoices();
		const nepaliVoice = voices.find(
			(v) =>
				v.lang.startsWith("ne") ||
				v.lang.includes("Nepali") ||
				v.voiceURI.toLowerCase().includes("nepali"),
		);

		const utter = new SpeechSynthesisUtterance(text);
		if (nepaliVoice) {
			utter.voice = nepaliVoice;
			utter.lang = "ne-NP";
		} else {
			// If no Nepali voice, still try to speak – may sound butchered but at least audible
			utter.lang = "ne-NP";
		}
		utter.rate = 0.9; // slightly slower for comprehension
		utter.pitch = 1.0;
		window.speechSynthesis.speak(utter);
	};

	// If voices already loaded, speak immediately; otherwise wait
	if (window.speechSynthesis.getVoices().length > 0) {
		trySpeak();
	} else {
		window.speechSynthesis.onvoiceschanged = () => {
			trySpeak();
		};
	}
}
