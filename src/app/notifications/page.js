"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, getDeviceId } from "../../lib/supabase";
import {
	Bell,
	Heart,
	MessageCircle,
	Star,
	Tag,
	AlertTriangle,
	CheckCheck,
	Loader2,
	Trash2,
	ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const NOTIFICATION_ICONS = {
	message: { icon: MessageCircle, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
	favorite: { icon: Heart, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
	review: { icon: Star, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
	price_drop: { icon: Tag, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
	expiry: { icon: AlertTriangle, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const userId = getDeviceId();

	useEffect(() => {
		if (!userId) { setLoading(false); return; }
		loadNotifications();
	}, []);

	const loadNotifications = async () => {
		const { data, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(50);
		if (!error) setNotifications(data || []);
		setLoading(false);
	};

	const markRead = async (id) => {
		await supabase.from("notifications").update({ is_read: true }).eq("id", id);
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
	};

	const markAllRead = async () => {
		await supabase
			.from("notifications")
			.update({ is_read: true })
			.eq("user_id", userId)
			.is("is_read", false);
		setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
	};

	const deleteNotification = async (id, e) => {
		e?.stopPropagation();
		await supabase.from("notifications").delete().eq("id", id);
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const unreadCount = notifications.filter((n) => !n.is_read).length;
	const timeAgo = (d) => {
		const diff = Date.now() - new Date(d).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return "Just now";
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	};

	return (
		<div className="pb-24">
			<div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
							<Bell size={24} /> Notifications
						</h1>
						{unreadCount > 0 && (
							<button
								onClick={markAllRead}
								className="bg-white/20 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition flex items-center gap-1.5"
							>
								<CheckCheck size={14} /> Mark all read
							</button>
						)}
					</div>
					<p className="text-sm text-white/80 font-medium mt-1">
						{unreadCount > 0
							? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
							: "All caught up!"}
					</p>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
				</div>
			) : notifications.length === 0 ? (
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-slate-700">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<Bell size={28} className="text-blue-500" />
					</div>
					<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">No notifications</h3>
					<p className="text-sm text-gray-500">You'll see updates here when someone interacts with your listings.</p>
				</div>
			) : (
				<div className="space-y-2">
					{notifications.map((notif) => {
						const meta = NOTIFICATION_ICONS[notif.type] || {
							icon: Bell,
							color: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400",
						};
						const Icon = meta.icon;
						return (
							<div
								key={notif.id}
								onClick={() => {
									if (!notif.is_read) markRead(notif.id);
									if (notif.link) window.location.href = notif.link;
								}}
								className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
									notif.is_read
										? "border-gray-100 dark:border-slate-700 opacity-70"
										: "border-blue-100 dark:border-blue-900 shadow-sm"
								}`}
							>
								<div className="flex gap-3">
									<div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center flex-shrink-0`}>
										<Icon size={18} />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<p className={`text-sm ${notif.is_read ? "font-medium" : "font-bold"} text-gray-900 dark:text-gray-100`}>
												{notif.title}
											</p>
											<div className="flex items-center gap-1 flex-shrink-0">
												{!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
												<button onClick={(e) => deleteNotification(notif.id, e)} className="text-gray-300 hover:text-red-500 p-0.5">
													<Trash2 size={12} />
												</button>
											</div>
										</div>
										{notif.body && (
											<p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.body}</p>
										)}
										<p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}