import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
	try {
		const { images } = await req.json();

		if (!images || images.length === 0) {
			return Response.json({ error: "No images provided" }, { status: 400 });
		}

		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

		// Use a model that exists in your list
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

		const prompt = `
You are an expert product analyst. Analyze the provided image(s) of a product and return a JSON object with the following fields:
- "title": A short, descriptive name for the product.
- "description": A detailed paragraph (3-5 sentences) describing the product, its features, material, and any notable details.
- "appearance": A separate paragraph describing how the product looks visually—color, shape, texture, condition, etc.
- "category": One of: Electronics, Fashion, Home & Garden, Toys & Games, Sports & Outdoors, Beauty & Health, Other.
- "condition": One of: New, Like New, Good, Fair, For Parts.
- "estimatedPrice": Suggested price in USD (e.g., "$25").

Respond ONLY with valid JSON. Do NOT include markdown formatting or extra text.
`;

		const imageParts = images.slice(0, 4).map((base64) => ({
			inlineData: {
				mimeType: "image/jpeg",
				data: base64,
			},
		}));

		const result = await model.generateContent([prompt, ...imageParts]);
		const response = await result.response;
		const text = response.text();

		// Clean and parse
		const cleaned = text.replace(/```json|```/g, "").trim();
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);

		return Response.json(parsed);
	} catch (error) {
		console.error("Gemini API error:", error);
		return Response.json(
			{ error: error.message || "Analysis failed" },
			{ status: 500 },
		);
	}
}
