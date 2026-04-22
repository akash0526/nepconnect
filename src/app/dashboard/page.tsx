"use client";

import { useEffect, useState } from "react";
import { logout } from "../../app/actions/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
	const router = useRouter();
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		// Fetch current user from your backend or decode JWT
		fetch("/api/me")
			.then((res) => res.json())
			.then((data) => setUser(data.user))
			.catch(() => router.push("/login"));
	}, []);

	async function handleLogout() {
		await logout();
		router.push("/login");
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			{user && <p>Welcome, {user.username}!</p>}
			<button
				onClick={handleLogout}
				className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
			>
				Logout
			</button>
		</div>
	);
}
