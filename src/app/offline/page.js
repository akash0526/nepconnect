"use client";
export default function OfflinePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-6">
			<div className="text-center max-w-sm">
				<div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
					<span className="text-4xl">📡</span>
				</div>
				<h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
					No Connection
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
					You seem to be offline. Check your connection and try again. Your
					saved data is still here.
				</p>
				<button
					onClick={() => window.location.reload()}
					className="btn-primary"
				>
					Try Again
				</button>
			</div>
		</div>
	);
}
