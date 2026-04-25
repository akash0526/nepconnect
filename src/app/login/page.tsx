"use client";

import { useState, useEffect } from "react";
import { login } from "../actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDeviceId } from "../../lib/supabase";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	// const [deviceId, setDeviceId] = useState("");

	// // Read device ID client-side (it lives in localStorage)
	// useEffect(() => {
	// 	setDeviceId(getDeviceId());
	// }, []);
	const [deviceId, setDeviceId] = useState("");
	useEffect(() => {
		setDeviceId(getDeviceId() ?? "");
	}, []);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		// Inject device_id so the server action can save it to users.device_id
		formData.set("device_id", deviceId);
		const result = await login(formData);
		if (result.error) {
			setError(
				typeof result.error === "string"
					? result.error
					: JSON.stringify(result.error),
			);
		} else if (result.redirectTo) {
			router.push(result.redirectTo);
		}
	}

	return (
		<div className="max-w-md mx-auto mt-10 p-6 border rounded">
			<h1 className="text-2xl font-bold mb-4">Login</h1>
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
					<label className="block text-sm font-medium">Password</label>
					<input
						name="password"
						type="password"
						required
						className="w-full border p-2 rounded"
					/>
				</div>
				{/* Hidden — sent to server so device_id is linked to the account */}
				<input type="hidden" name="device_id" value={deviceId} />
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded"
				>
					Login
				</button>
			</form>
			{error && <p className="text-red-600 mt-2">{error}</p>}
			<p className="mt-4 text-sm">
				Don't have an account?{" "}
				<Link href="/signup" className="text-blue-600">
					Sign up
				</Link>
			</p>
		</div>
	);
}
