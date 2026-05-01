import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";
export const maxDuration = 30;

const MODEL_FALLBACKS = [
	"gemini-2.5-flash",
	"gemini-2.0-flash",
	"gemini-1.5-flash",
];

export async function POST(req) {
	try {
		const { images } = await req.json();

		if (!images || images.length === 0) {
			return new Response(JSON.stringify({ error: "No image provided" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			return new Response(
				JSON.stringify({ error: "Server configuration error" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const genAI = new GoogleGenerativeAI(apiKey);

		const prompt = `
You are an expert plant pathologist and agronomist. Analyze the provided image of a crop leaf or plant part and identify the most probable disease or pest damage. Return a JSON object with:

- "disease": The name of the disease or pest (e.g., "Late Blight", "Aphid infestation")
- "confidence": A number between 0 and 1 representing your confidence (use 0 if unsure)
- "description": A short description of the disease and how it affects the plant
- "organic_treatment": A list of 2-3 organic, sustainable treatment or prevention methods

If the plant looks healthy, set "disease" to "No disease detected", confidence to 1.0, and give general care tips.
If the image is not a plant or leaf, set "disease" to "Not a plant image", confidence to 0, and explain.

Return ONLY the JSON object, without markdown or extra text.
`;

		const imageParts = images.slice(0, 1).map((base64) => ({
			inlineData: { mimeType: "image/jpeg", data: base64 },
		}));

		let lastError = null;
		for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
			const modelName = MODEL_FALLBACKS[i];
			try {
				const model = genAI.getGenerativeModel({ model: modelName });
				const result = await model.generateContent([prompt, ...imageParts]);
				const response = await result.response;
				const text = response.text();
				const cleaned = text.replace(/```json|```/g, "").trim();
				const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
				const parsed = jsonMatch
					? JSON.parse(jsonMatch[0])
					: JSON.parse(cleaned);
				return new Response(JSON.stringify(parsed), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			} catch (error) {
				lastError = error;
				if (error.status === 503) {
					await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
				}
			}
		}

		throw lastError || new Error("All models failed");
	} catch (error) {
		console.error("Diagnosis error:", error);
		return new Response(
			JSON.stringify({
				error: "Diagnosis service temporarily unavailable. Please try again.",
			}),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}
}
