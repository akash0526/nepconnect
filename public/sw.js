// ── NepConnect Service Worker (Offline Support) ──
const CACHE = "nepconnect-v1";
const STATIC_ASSETS = [
	"/",
	"/offline",
];

// Install
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
			);
		}),
	);
	self.clients.claim();
});

// Fetch with network-first, cache-fallback strategy
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests
	if (event.request.method !== "GET") return;

	// For API requests, try network only
	if (event.request.url.includes("/api/")) {
		return;
	}

	// For static assets, use cache-first
	if (
		event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/)
	) {
		event.respondWith(
			caches.match(event.request).then((cached) => cached || fetch(event.request)),
		);
		return;
	}

	// For pages, use network-first, fallback to cache
	event.respondWith(
		fetch(event.request)
			.then((response) => {
				// Cache successful responses
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE).then((cache) => cache.put(event.request, clone));
				}
				return response;
			})
			.catch(async () => {
				const cached = await caches.match(event.request);
				if (cached) return cached;

				// If it's a navigation request, show offline page
				if (event.request.mode === "navigate") {
					const offlinePage = await caches.match("/offline");
					if (offlinePage) return offlinePage;
				}

				return new Response("Offline", { status: 503 });
			}),
	);
});

// ── Background Sync for offline messages ──
self.addEventListener("sync", (event) => {
	if (event.tag === "sync-messages") {
		event.waitUntil(syncMessages());
	}
});

async function syncMessages() {
	try {
		const db = await openDB();
		const pending = await db.getAll("pending_messages");
		for (const msg of pending) {
			await fetch("/api/messages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(msg),
			});
			await db.delete("pending_messages", msg.id);
		}
	} catch (err) {
		console.error("Sync failed:", err);
	}
}

// ── Push Notifications ──
self.addEventListener("push", (event) => {
	if (!event.data) return;

	try {
		const data = event.data.json();
		const options = {
			body: data.body || "New update from NepConnect",
			icon: "/icon-192.png",
			badge: "/badge.png",
			vibrate: [200, 100, 200],
			data: {
				url: data.link || "/",
			},
			actions: [
				{ action: "view", title: "View" },
				{ action: "close", title: "Dismiss" },
			],
		};

		event.waitUntil(
			self.registration.showNotification(data.title || "NepConnect", options),
		);
	} catch (err) {
		console.error("Push notification error:", err);
	}
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "close") return;

	const url = event.notification.data?.url || "/";
	event.waitUntil(
		clients.openWindow(url),
	);
});