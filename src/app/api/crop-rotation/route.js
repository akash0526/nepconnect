import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
	try {
		const { currentCrop, location, season } = await request.json();

		if (!currentCrop) {
			return NextResponse.json({ error: "Current crop is required" }, { status: 400 });
		}

		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const prompt = `You are an expert agricultural advisor for Nepal. Suggest the best crop rotation plan.

Current crop: "${currentCrop}"
Location: ${location || "Nepal"} (typically in the Terai, Hilly, or Himalayan region)
Season: ${season || "Next season"}

Give 3-4 best crop rotation recommendations. Consider:
- Soil nutrient management
- Pest and disease prevention
- Nepal's climate and seasons
- Market demand in Nepal

Respond with ONLY a valid JSON object (no markdown, no other text):
{
  "rotations": [
    {
      "crop_name": "<Nepali name (English name)>",
      "emoji": "<emoji>",
      "benefits": "<brief benefit in English>",
      "benefits_ne": "<brief benefit in Nepali>",
      "season": "<season to plant>",
      "days_to_harvest": <number>,
      "compatibility": "<high|medium|low>"
    }
  ],
  "advice": "<general farming advice in English>",
  "advice_ne": "<general farming advice in Nepali>"
}`;

		const result = await model.generateContent(prompt);
		const text = result.response.text();
		const clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();
		const data = JSON.parse(clean);

		return NextResponse.json(data);
	} catch (err) {
		console.error("Crop rotation error:", err);
		// Fallback static data
		return NextResponse.json({
			rotations: [
				{
					crop_name: "मकै (Maize)",
					emoji: "🌽",
					benefits: "Adds organic matter to soil, breaks pest cycles",
					benefits_ne: "माटोमा जैविक पदार्थ थप्छ, कीरा चक्र तोड्छ",
					season: "Spring (March-April)",
					days_to_harvest: 100,
					compatibility: "high",
				},
				{
					crop_name: "गहुँ (Wheat)",
					emoji: "🌾",
					benefits: "Good winter crop, suppresses weeds",
					benefits_ne: "जाडो बाली, झार नियन्त्रण गर्छ",
					season: "Winter (November-December)",
					days_to_harvest: 120,
					compatibility: "high",
				},
				{
					crop_name: "मसुरो (Lentil)",
					emoji: "🫘",
					benefits: "Nitrogen fixing, improves soil fertility",
					benefits_ne: "नाइट्रोजन स्थिरीकरण, माटो उर्वरा बनाउँछ",
					season: "Winter (October-November)",
					days_to_harvest: 90,
					compatibility: "medium",
				},
			],
			advice: "Crop rotation helps maintain soil health and reduces pest pressure.",
			advice_ne: "बाली चक्रले माटोको स्वास्थ्य कायम राख्छ र कीराको दबाब कम गर्छ।",
		});
	}
}