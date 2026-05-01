export const runtime = "edge";

// Convert wind speed at 2m to an approximate 10m height (if needed)
// Simple Hargreaves ETo equation: ETo = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * Ra
function calcHargreavesETo(tmin, tmax, tmean, ra) {
	return 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * ra;
}

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const lat = searchParams.get("lat") || "27.7172";
	const lon = searchParams.get("lon") || "85.3240";

	// NASA POWER daily data for the last 7 days from today
	const today = new Date();
	const start = new Date(today);
	start.setDate(today.getDate() - 7);
	const startStr = start.toISOString().slice(0, 10).replace(/-/g, "");
	const endStr = today.toISOString().slice(0, 10).replace(/-/g, "");

	const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MIN,T2M_MAX,RH2M,PRECTOTCORR,WS2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&start=${startStr}&end=${endStr}&format=JSON`;

	const response = await fetch(url);
	const data = await response.json();

	const props = data.properties.parameter;
	const daily = [];
	// Iterate over dates
	const dates = Object.keys(props.T2M).sort();
	// Current conditions from the most recent day
	const lastDate = dates[dates.length - 1];
	const current = {
		temp: props.T2M[lastDate]?.toFixed(1),
		humidity: props.RH2M[lastDate]?.toFixed(1),
		solar: props.ALLSKY_SFC_SW_DWN[lastDate]?.toFixed(2),
	};

	// Build daily array
	dates.forEach((date) => {
		const tmax = props.T2M_MAX[date];
		const tmin = props.T2M_MIN[date];
		const tmean = props.T2M[date];
		const rain = props.PRECTOTCORR[date];
		// Approximate extraterrestrial radiation Ra (simplified)
		const doy = new Date(
			date.slice(0, 4),
			date.slice(4, 6) - 1,
			date.slice(6, 8),
		);
		// We'll omit complex Ra calculation for now; just return the other data
		daily.push({
			date: date.slice(6, 8) + "/" + date.slice(4, 6),
			temp_max: tmax,
			temp_min: tmin,
			rain: rain,
		});
	});

	return Response.json({ current, daily });
}
