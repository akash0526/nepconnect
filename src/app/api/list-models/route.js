import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
	try {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
		);
		const data = await response.json();
		return Response.json(data);
	} catch (error) {
		return Response.json({ error: error.message }, { status: 500 });
	}
}
