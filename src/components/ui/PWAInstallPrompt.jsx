"use client";
import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if already installed
		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsInstalled(true);
			return;
		}

		const handler = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			// Show prompt after 30 seconds (don't show immediately)
			setTimeout(() => setShowPrompt(true), 30000);
		};

		window.addEventListener("beforeinstallprompt", handler);

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const result = await deferredPrompt.userChoice;
		if (result.outcome === "accepted") {
			setIsInstalled(true);
		}
		setDeferredPrompt(null);
		setShowPrompt(false);
	};

	if (isInstalled || !showPrompt || !deferredPrompt) return null;

	return (
		<div className="fixed bottom-28 left-4 right-4 z-50 animate-slide-up sm:max-w-sm sm:mx-auto sm:left-auto sm:right-auto">
			<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3">
				<div className="w-12 h-12 bg-[var(--color-primary-light)] rounded-xl flex items-center justify-center flex-shrink-0">
					<Download size={22} className="text-[var(--color-primary)]" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-bold text-sm text-gray-900 dark:text-gray-100">Install NepConnect</p>
					<p className="text-xs text-gray-500">Add to home screen for easy access</p>
				</div>
				<button
					onClick={handleInstall}
					className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[var(--color-primary-dark)] transition"
				>
					Install
				</button>
				<button onClick={() => setShowPrompt(false)} className="text-gray-300 hover:text-gray-500 p-1">
					<X size={16} />
				</button>
			</div>
		</div>
	);
}