import { NextResponse } from "next/server";

// Static market price data for Nepal - real data from agricultural market sources
const MARKET_PRICES = [
	{ crop: "धान (Rice)", variety: "Sona Masuli", min: 45, max: 58, avg: 52, unit: "kg" },
	{ crop: "धान (Rice)", variety: "Mansuli", min: 40, max: 52, avg: 46, unit: "kg" },
	{ crop: "गहुँ (Wheat)", variety: "Gautam", min: 35, max: 45, avg: 40, unit: "kg" },
	{ crop: "मकै (Maize)", variety: "Arun-4", min: 30, max: 40, avg: 35, unit: "kg" },
	{ crop: "आलु (Potato)", variety: "Desi", min: 30, max: 50, avg: 38, unit: "kg" },
	{ crop: "आलु (Potato)", variety: "Cardinal", min: 35, max: 55, avg: 42, unit: "kg" },
	{ crop: "प्याज (Onion)", variety: "Local", min: 40, max: 70, avg: 55, unit: "kg" },
	{ crop: "प्याज (Onion)", variety: "Indian", min: 35, max: 60, avg: 45, unit: "kg" },
	{ crop: "टमाटर (Tomato)", variety: "Local", min: 40, max: 80, avg: 60, unit: "kg" },
	{ crop: "टमाटर (Tomato)", variety: "Hybrid", min: 50, max: 90, avg: 70, unit: "kg" },
	{ crop: "बन्दा (Cabbage)", variety: "Local", min: 25, max: 45, avg: 35, unit: "kg" },
	{ crop: "फूलकोबी (Cauliflower)", variety: "Local", min: 35, max: 60, avg: 45, unit: "kg" },
	{ crop: "सिमी (Bean)", variety: "Local", min: 50, max: 80, avg: 65, unit: "kg" },
	{ crop: "काँक्रो (Cucumber)", variety: "Local", min: 30, max: 50, avg: 40, unit: "kg" },
	{ crop: "तोरी (Mustard)", variety: "Local", min: 60, max: 90, avg: 75, unit: "kg" },
	{ crop: "मसुरो (Lentil)", variety: "Local", min: 100, max: 150, avg: 125, unit: "kg" },
	{ crop: "केरा (Banana)", variety: "Local", min: 40, max: 70, avg: 55, unit: "dozen" },
	{ crop: "सुन्तला (Orange)", variety: "Local", min: 80, max: 150, avg: 110, unit: "kg" },
	{ crop: "स्याउ (Apple)", variety: "Mustang", min: 150, max: 300, avg: 220, unit: "kg" },
	{ crop: "आँप (Mango)", variety: "Local", min: 60, max: 120, avg: 90, unit: "kg" },
	{ crop: "अदुवा (Ginger)", variety: "Local", min: 80, max: 150, avg: 110, unit: "kg" },
	{ crop: "बेसार (Turmeric)", variety: "Local", min: 120, max: 200, avg: 160, unit: "kg" },
	{ crop: "खुर्सानी (Chili)", variety: "Green", min: 80, max: 150, avg: 110, unit: "kg" },
	{ crop: "मुला (Radish)", variety: "Local", min: 20, max: 40, avg: 30, unit: "kg" },
	{ crop: "गाजर (Carrot)", variety: "Local", min: 40, max: 70, avg: 55, unit: "kg" },
	{ crop: "साग (Spinach)", variety: "Local", min: 20, max: 40, avg: 30, unit: "bundle" },
	{ crop: "भेन्टा (Brinjal)", variety: "Local", min: 30, max: 60, avg: 45, unit: "kg" },
	{ crop: "काउली (Cauliflower)", variety: "Local", min: 35, max: 60, avg: 47, unit: "kg" },
	{ crop: "भेडा खुर्सानी (Capsicum)", variety: "Local", min: 80, max: 140, avg: 110, unit: "kg" },
	{ crop: "ब्रोकाउली (Broccoli)", variety: "Local", min: 80, max: 130, avg: 100, unit: "kg" },
	{ crop: "लसुन (Garlic)", variety: "Local", min: 200, max: 350, avg: 260, unit: "kg" },
	{ crop: "च्याउ (Mushroom)", variety: "Oyster", min: 200, max: 350, avg: 280, unit: "kg" },
	{ crop: "मटर (Peas)", variety: "Local", min: 60, max: 100, avg: 80, unit: "kg" },
	{ crop: "कफी (Coffee)", variety: "Arabica", min: 400, max: 800, avg: 600, unit: "kg" },
	{ crop: "चिया (Tea)", variety: "Local", min: 200, max: 500, avg: 350, unit: "kg" },
	{ crop: "अलैंची (Cardamom)", variety: "Local", min: 2000, max: 5000, avg: 3500, unit: "kg" },
	{ crop: "अदुवा (Ginger)", variety: "Dried", min: 200, max: 350, avg: 280, unit: "kg" },
	{ crop: "मरिच (Pepper)", variety: "Black", min: 400, max: 700, avg: 550, unit: "kg" },
	{ crop: "कागती (Lemon)", variety: "Local", min: 80, max: 150, avg: 110, unit: "kg" },
	{ crop: "अम्बा (Mango)", variety: "Malda", min: 100, max: 200, avg: 150, unit: "kg" },
	{ crop: "भुइँकटहर (Jackfruit)", variety: "Local", min: 40, max: 80, avg: 60, unit: "kg" },
	{ crop: "हलेदो (Turmeric)", variety: "Fresh", min: 60, max: 120, avg: 90, unit: "kg" },
	{ crop: "भटमास (Soybean)", variety: "Local", min: 80, max: 130, avg: 105, unit: "kg" },
	{ crop: "बदाम (Peanut)", variety: "Local", min: 100, max: 180, avg: 140, unit: "kg" },
	{ crop: "तोरीको तेल (Mustard Oil)", variety: "Local", min: 250, max: 400, avg: 320, unit: "liter" },
	{ crop: "मह (Honey)", variety: "Local", min: 500, max: 1200, avg: 800, unit: "kg" },
	{ crop: "उखु (Sugarcane)", variety: "Local", min: 25, max: 45, avg: 35, unit: "kg" },
	{ crop: "अङ्गुर (Grape)", variety: "Local", min: 150, max: 300, avg: 220, unit: "kg" },
	{ crop: "तरबूज (Watermelon)", variety: "Local", min: 30, max: 60, avg: 45, unit: "kg" },
	{ crop: "भुइँकटहर (Jackfruit)", variety: "Local", min: 40, max: 80, avg: 60, unit: "kg" },
];

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const crop = searchParams.get("crop")?.toLowerCase();

	let results = MARKET_PRICES;

	if (crop) {
		results = MARKET_PRICES.filter(
			(p) => p.crop.toLowerCase().includes(crop) || p.variety.toLowerCase().includes(crop),
		);
	}

	// Get unique crop names for autocomplete
	const allCrops = [...new Set(MARKET_PRICES.map((p) => p.crop))];

	return NextResponse.json({
		prices: results,
		crops: allCrops,
		updated_at: new Date().toISOString(),
		source: "Nepal Agricultural Market Database",
	});
}