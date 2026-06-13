"use client";

import { useState } from "react";
import { signup } from "../actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Mail, Phone, Lock } from "lucide-react";

export default function SignupPage() {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [step, setStep] = useState(1); // 1: form, 2: success

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(event.currentTarget);
		const result = await signup(formData);

		if (result.error) {
			setError(JSON.stringify(result.error));
			setLoading(false);
		} else {
			setMessage(result.message || "Account created! Check your email to verify.");
			setStep(2);
			setLoading(false);
		}
	}

	if (step === 2) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
				<div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 dark:shadow-green-900/30">
					<CheckCircle2 size={40} className="text-white" />
				</div>
				<h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
					Account Created! 🎉
				</h1>
				<p className="text-sm text-gray-500 max-w-sm mb-8">
					{message}
				</p>
				<Link
					href="/login"
					className="btn-primary"
				>
					Go to Login
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Back */}
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
					<UserPlus size={28} className="text-white" />
				</div>
				<h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
					Create Account
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Join our local marketplace community
				</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1">
						<UserPlus size={12} /> Username
					</label>
					<input
						name="username"
						required
						placeholder="Choose a username"
						className="input-field"
						autoComplete="username"
					/>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1">
						<Mail size={12} /> Email
					</label>
					<input
						name="email"
						type="email"
						required
						placeholder="your@email.com"
						className="input-field"
						autoComplete="email"
					/>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1">
						<Phone size={12} /> Phone (optional)
					</label>
					<input
						name="phone_number"
						type="tel"
						placeholder="98XXXXXXXX"
						className="input-field"
						autoComplete="tel"
					/>
				</div>

				<div className="space-y-1.5">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 flex items-center gap-1">
						<Lock size={12} /> Password
					</label>
					<div className="relative">
						<input
							name="password"
							type={showPassword ? "text" : "password"}
							required
							minLength={6}
							placeholder="At least 6 characters"
							className="input-field pr-12"
							autoComplete="new-password"
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

				<button
					type="submit"
					disabled={loading}
					className="btn-primary w-full py-3.5 text-sm"
				>
					{loading ? (
						<Loader2 className="animate-spin" size={18} />
					) : (
						<UserPlus size={18} />
					)}
					{loading ? "Creating account..." : "Create Account"}
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

			{/* Login link */}
			<p className="mt-8 text-center text-sm text-gray-500">
				Already have an account?{" "}
				<Link
					href="/login"
					className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:underline"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}