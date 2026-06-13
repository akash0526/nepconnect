import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request) {
	try {
		const { title, category, description, condition } = await request.json();

		if (!title) {
			return NextResponse.json({ error: "Title is required" }, { status: 400 });
		}

		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const prompt = `You are a Nepal market pricing expert. Suggest a fair price for this item.

Item: "${title}"
Category: ${category || "General"}
Description: "${description || "No description"}"
Condition: ${condition || "Used"}

The platform is NepConnect, a local marketplace in Nepal. Prices should be in NPR (Nepali Rupees).

Respond with ONLY a valid JSON object (no markdown, no other text):
{
  "suggested_price": <number>,
  "price_range_low": <number>,
  "price_range_high": <number>,
  "confidence": <"high" | "medium" | "low">,
  "reasoning": "<1 sentence explanation in English>",
  "reasoning_ne": "<1 sentence explanation in Nepali>"
}`;

		const result = await model.generateContent(prompt);
		const text = result.response.text();
		const clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();
		const data = JSON.parse(clean);

		return NextResponse.json(data);
	} catch (err) {
		console.error("Price suggestion error:", err);
		return NextResponse.json(
			{
				suggested_price: null,
				error: "Could not generate price suggestion",
				fallback: true,
			},
			{ status: 200 },
		);
	}
}