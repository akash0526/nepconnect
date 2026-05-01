import { useState, useMemo } from "react";

export function useWeather() {
	const [location, setLocation] = useState({ lat: 27.7172, lng: 85.324 });
	const [weather, setWeather] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchWeather = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/weather?lat=${location.lat}&lon=${location.lng}`,
			);
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			setWeather(data);
		} catch (err) {
			setError(err.message);
			setWeather(null);
		} finally {
			setLoading(false);
		}
	};

	const updateLocation = (lat, lng) => {
		setLocation({ lat, lng });
		// Optionally auto‑fetch later
	};

	// Simplified weather for the farmer UI
	const simpleWeather = useMemo(() => {
		if (!weather) return null;

		const today = weather.daily?.[0] || {};
		const temp = weather.current?.temp || 0;
		const rain = today.rain || 0;

		let mainIcon = "☀️";
		let bgColor = "bg-yellow-50";
		if (rain > 10) {
			mainIcon = "🌧️";
			bgColor = "bg-blue-50";
		} else if (rain > 2) {
			mainIcon = "🌦️";
			bgColor = "bg-blue-50";
		} else if (temp < 10) {
			mainIcon = "❄️";
			bgColor = "bg-indigo-50";
		} else if (temp >= 30) {
			mainIcon = "☀️";
			bgColor = "bg-orange-50";
		} else if (temp > 20) {
			mainIcon = "⛅";
			bgColor = "bg-yellow-50";
		}

		const nepaliDays = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
		const forecast = weather.daily?.slice(0, 4).map((d, i) => {
			const dateObj = new Date();
			dateObj.setDate(dateObj.getDate() + i + 1);
			const dayIdx = dateObj.getDay();
			let icon = "☀️";
			if (d.rain > 10) icon = "🌧️";
			else if (d.rain > 2) icon = "🌦️";
			else if (d.temp_max > 30) icon = "☀️";
			else if (d.temp_max < 15) icon = "❄️";
			return { day: nepaliDays[dayIdx], icon, rain: d.rain, temp: d.temp_max };
		});

		return { mainIcon, bgColor, temp, rain, forecast };
	}, [weather]);

	return {
		location,
		weather,
		loading,
		error,
		fetchWeather,
		updateLocation,
		simpleWeather,
	};
}
