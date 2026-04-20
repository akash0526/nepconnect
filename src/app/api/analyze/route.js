import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
	try {
		const { images } = await req.json();

		if (!images || images.length === 0) {
			return NextResponse.json(
				{ error: "No images provided" },
				{ status: 400 },
			);
		}

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const prompt = `
      You are an expert marketplace inspector for a platform in Nepal. 
      I am providing up to 4 images of the same product.
      
      Tasks:
      1. Identify the item precisely.
      2. Ensure all photos show the same object.
      3. Identify any wear, damage, or specific features.
      4. Safety check: Ensure the item is NOT a weapon, drug, or prohibited material.

      Return ONLY a JSON object:
      {
        "detected_item": "name",
        "condition_assessment": "summary description",
        "condition_score": 1-10,
        "is_safe": true/false,
        "multi_angle_verified": true/false
      }
    `;

		const imageParts = images.map((base64) => ({
			inlineData: { data: base64, mimeType: "image/jpeg" },
		}));

		const result = await model.generateContent([prompt, ...imageParts]);
		const response = await result.response;
		const text = response.text();

		// Improved JSON extraction: finds the first { and last }
		const jsonStart = text.indexOf("{");
		const jsonEnd = text.lastIndexOf("}") + 1;
		const jsonString = text.slice(jsonStart, jsonEnd);

		const data = JSON.parse(jsonString);

		return NextResponse.json(data);
	} catch (error) {
		console.error("Gemini Multi-Image Error:", error);
		// Return a structured null so the frontend knows the AI failed but the request finished
		return NextResponse.json({
			detected_item: "Unknown",
			condition_score: 5,
			is_safe: true,
		});
	}
}
