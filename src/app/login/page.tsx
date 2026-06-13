"use client";

import { useState, useEffect } from "react";
import { login } from "../actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDeviceId } from "../../lib/supabase";
import { LogIn, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [deviceId, setDeviceId] = useState("");

	useEffect(() => {
		setDeviceId(getDeviceId() ?? "");
	}, []);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(event.currentTarget);
		formData.set("device_id", deviceId);
		const result = await login(formData);

		if (result.error) {
			setError(
				typeof result.error === "string"
					? result.error
					: JSON.stringify(result.error),
			);
			setLoading(false);
		} else if (result.redirectTo) {
			router.push(result.redirectTo);
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Back button */}
			<button
				onClick={() => router.back()}
				className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 w-fit"
			>
				<ArrowLeft size={20} />
				<span className="font-medium text-sm">Back</span>
			</button>

			{/* Header */}
			<div className="text-center mb-8">
				<div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 dark:shadow-green-900/30">
					<LogIn size={28} className="text-white" />
				</div>
				<h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
					Welcome Back
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Sign in to your NepConnect account
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
						Username
					</label>
					<input
						name="username"
						required
						placeholder="Enter your username"
						className="input-field"
						autoComplete="username"
					/>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
						Password
					</label>
					<div className="relative">
						<input
							name="password"
							type={showPassword ? "text" : "password"}
							required
							placeholder="Enter your password"
							className="input-field pr-12"
							autoComplete="current-password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>
				</div>

				<input type="hidden" name="device_id" value={deviceId} />

				<button
					type="submit"
					disabled={loading}
					className="btn-primary w-full py-3.5 text-sm"
				>
					{loading ? (
						<Loader2 className="animate-spin" size={18} />
					) : (
						<LogIn size={18} />
					)}
					{loading ? "Signing in..." : "Sign In"}
				</button>
			</form>

			{/* Error */}
			{error && (
				<div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 animate-slide-down">
					<p className="text-sm font-medium text-red-700 dark:text-red-400">
						{error}
					</p>
				</div>
			)}

			{/* Signup link */}
			<p className="mt-8 text-center text-sm text-gray-500">
				Don&apos;t have an account?{" "}
				<Link
					href="/signup"
					className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline"
				>
					Create one
				</Link>
			</p>

			{/* Guest browsing */}
			<div className="mt-6 text-center">
				<Link
					href="/"
					className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
				>
					Continue as guest
				</Link>
			</div>
		</div>
	);
}