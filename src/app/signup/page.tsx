"use client";

import { useState } from "react";
import { signup } from "../actions/auth";
import Link from "next/link";

export default function SignupPage() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const result = await signup(formData);
		if (result.error) {
			setError(JSON.stringify(result.error));
			setMessage("");
		} else {
			setMessage(result.message || "");
			setError("");
		}
	}

	return (
		<div className="max-w-md mx-auto mt-10 p-6 border rounded">
			<h1 className="text-2xl font-bold mb-4">Sign Up</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium">Username</label>
					<input
						name="username"
						required
						className="w-full border p-2 rounded"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">Email</label>
					<input
						name="email"
						type="email"
						required
						className="w-full border p-2 rounded"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">
						Phone Number (optional)
					</label>
					<input
						name="phone_number"
						type="tel"
						className="w-full border p-2 rounded"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium">Password</label>
					<input
						name="password"
						type="password"
						required
						className="w-full border p-2 rounded"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded"
				>
					Sign Up
				</button>
			</form>
			{message && <p className="text-green-600 mt-2">{message}</p>}
			{error && <p className="text-red-600 mt-2">{error}</p>}
			<p className="mt-4 text-sm">
				Already have an account?{" "}
				<Link href="/login" className="text-blue-600">
					Login
				</Link>
			</p>
		</div>
	);
}
