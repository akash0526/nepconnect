import { useState, useMemo } from "react";
import imageCompression from "browser-image-compression";

export function useDiagnosis() {
	const [leafImage, setLeafImage] = useState(null);
	const [diagnosis, setDiagnosis] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleLeafCapture = async (file) => {
		if (!file) return;
		setError(null);
		try {
			const compressed = await imageCompression(file, {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 1024,
				useWebWorker: true,
			});
			const reader = new FileReader();
			reader.onloadend = () => {
				setLeafImage(reader.result);
				setDiagnosis(null);
			};
			reader.readAsDataURL(compressed);
		} catch (err) {
			setError("Image compression failed");
		}
	};

	const runDiagnosis = async () => {
		if (!leafImage) return;
		setLoading(true);
		setError(null);
		try {
			const base64 = leafImage.split(",")[1];
			const res = await fetch("/api/diagnose", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ images: [base64] }),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setDiagnosis(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const clear = () => {
		setLeafImage(null);
		setDiagnosis(null);
		setError(null);
	};

	// Simplified for farmer UI
	const simplifiedDiagnosis = useMemo(() => {
		if (!diagnosis) return null;
		const isHealthy = diagnosis.disease === "No disease detected";
		return {
			isHealthy,
			title: isHealthy ? "बाली स्वस्थ" : "रोग लागेको",
			icon: isHealthy ? "🟢" : "🔴",
			messageNepali: isHealthy
				? "तपाईंको बाली स्वस्थ देखिन्छ।"
				: `${diagnosis.disease} देखियो।`,
			steps:
				diagnosis.organic_treatment?.map((t, i) => ({
					icon: ["🧴", "✂️", "💧"][i] || "✅",
					text: t,
				})) || [],
		};
	}, [diagnosis]);

	return {
		leafImage,
		diagnosis,
		loading,
		error,
		handleLeafCapture,
		runDiagnosis,
		clear,
		simplifiedDiagnosis,
	};
}
