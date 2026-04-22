import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_APP_PASSWORD,
	},
});

export async function sendVerificationEmail(to: string, token: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
	const verificationLink = `${baseUrl}/api/verify-email?token=${token}`;

	await transporter.sendMail({
		from: `"NepConnect" <${process.env.GMAIL_USER}>`,
		to,
		subject: "Verify your email",
		html: `
      <h1>Welcome to NepConnect!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
	});
}
