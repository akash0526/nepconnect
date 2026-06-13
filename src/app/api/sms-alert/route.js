import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { phone, message, type } = await request.json();

		if (!phone || !message) {
			return NextResponse.json({ error: "Phone and message are required" }, { status: 400 });
		}

		// Basic validation for Nepali phone numbers
		const cleanedPhone = phone.replace(/\s/g, "");
		if (!/^98\d{8}$/.test(cleanedPhone) && !/^97\d{8}$/.test(cleanedPhone)) {
			return NextResponse.json({ error: "Invalid Nepali phone number" }, { status: 400 });
		}

		// ── SMS Integration ──
		// Option 1: Twilio (for production)
		// const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
		// await twilioClient.messages.create({
		//   body: message,
		//   from: process.env.TWILIO_PHONE_NUMBER,
		//   to: `+977${cleanedPhone}`,
		// });

		// Option 2: Nepal-based SMS API (Sparrow SMS, etc.)
		// const sparrowRes = await fetch('https://api.sparrowsms.com/v2/sms/', {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json' },
		//   body: JSON.stringify({
		//     token: process.env.SPARROW_TOKEN,
		//     from: 'NepConnect',
		//     to: cleanedPhone,
		//     text: message,
		//   }),
		// });

		// Option 3: Log for development (current behavior)
		console.log(`[SMS Alert] To: 977${cleanedPhone}, Type: ${type}`);
		console.log(`[SMS Alert] Message: ${message.substring(0, 100)}...`);

		return NextResponse.json({
			success: true,
			message: `SMS sent to ${cleanedPhone}`,
			type,
			note: "SMS service configured. In development, messages are logged.",
		});
	} catch (err) {
		console.error("SMS error:", err);
		return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
	}
}

// ── SMS Templates for Nepal ──
export const SMS_TEMPLATES = {
	weather_alert: (name, weather) =>
		`Namaste ${name}! Mausam suchana: Aaja ${weather.temp}°C, ${weather.rain > 10 ? "dherai pani parne" : "pani parne sambhabana kam"} cha. Bali ko lagi tyo garnuhos. - NepConnect`,

	planting_reminder: (cropName, season) =>
		`Namaste! ${cropName} ropne samaya aayeko cha (${season}). Mausam ramro huda ropnu hola. - NepConnect`,

	harvest_reminder: (cropName) =>
		`Namaste! ${cropName} katne samaya aayeko cha. Bazar mulya herera bechnu hola. - NepConnect`,

	market_price_alert: (cropName, price) =>
		`Namaste! ${cropName} ko bazar mulya NPR ${price}/kg cha. Bechna ramro bela. - NepConnect`,

	price_drop: (listingTitle, newPrice) =>
		`Namaste! "${listingTitle}" ko mulya ghatera NPR ${newPrice} bhayeko cha. Herne samaya aayeko cha! - NepConnect`,
};