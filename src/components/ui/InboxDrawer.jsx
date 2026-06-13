"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { supabase, getDeviceId } from "../../lib/supabase";

export default function InboxDrawer({ listing, userId, sellerId, onClose }) {
	const [conversation, setConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const deviceId = getDeviceId();

	useEffect(() => {
		if (!listing?.id) return;
		initChat();
	}, [listing?.id]);

	const initChat = async () => {
		if (!sellerId) return;

		try {
			// Check for existing conversation
			let query = supabase
				.from("conversations")
				.select("*")
				.eq("listing_id", listing.id)
				.eq("seller_id", sellerId);

			if (userId) {
				query = query.eq("buyer_id", userId);
			} else {
				query = query.is("buyer_id", null).eq("buyer_device_id", deviceId);
			}

			const { data: existing } = await query.single();

			if (existing) {
				setConversation(existing);
				loadMessages(existing.id);
			} else {
				// Create new conversation
				const insertData = {
					listing_id: listing.id,
					seller_id: sellerId,
				};
				if (userId) {
					insertData.buyer_id = userId;
					insertData.buyer_device_id = deviceId;
				} else {
					insertData.buyer_device_id = deviceId;
				}

				const { data, error } = await supabase
					.from("conversations")
					.insert([insertData])
					.select()
					.single();

				if (!error && data) {
					setConversation(data);
				}
			}
		} catch (err) {
			console.error("Chat init error:", err);
		}
	};

	const loadMessages = async (convId) => {
		const { data } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", convId)
			.order("created_at", { ascending: true });
		if (data) setMessages(data);
	};

	// Subscribe to realtime messages
	useEffect(() => {
		if (!conversation?.id) return;
		const channel = supabase
			.channel(`messages:${conversation.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `conversation_id=eq.${conversation.id}`,
				},
				(payload) => {
					setMessages((prev) => {
						if (prev.find((m) => m.id === payload.new.id)) return prev;
						return [...prev, payload.new];
					});
				},
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	}, [conversation?.id]);

	const sendMessage = async () => {
		if (!text.trim() || !conversation?.id) return;
		setLoading(true);

		const { data, error } = await supabase
			.from("messages")
			.insert([{
				conversation_id: conversation.id,
				sender_id: userId,
				sender_device_id: deviceId,
				text: text.trim(),
			}])
			.select()
			.single();

		if (!error && data) {
			setMessages((prev) => [...prev, data]);
			await supabase
				.from("conversations")
				.update({ last_message_at: new Date().toISOString() })
				.eq("id", conversation.id);

			// Notify seller
			if (sellerId && sellerId !== userId) {
				await supabase.from("notifications").insert([{
					user_id: sellerId,
					type: "message",
					title: `New message about "${listing.title}"`,
					body: text.trim().substring(0, 100),
					data: { listing_id: listing.id, conversation_id: conversation.id },
					link: `/inbox/${conversation.id}`,
				}]);
			}
			setText("");
		}
		setLoading(false);
	};

	const isOwn = (senderId) => senderId === userId;

	return (
		<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-lg">
			<div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-700">
				<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
					<ArrowLeft size={18} />
				</button>
				<div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
					<MessageCircle size={14} className="text-[var(--color-primary)]" />
				</div>
				<span className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
					Chat about "{listing?.title}"
				</span>
			</div>

			<div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900/50">
				{messages.length === 0 && (
					<div className="flex items-center justify-center h-full text-sm text-gray-400">
						Send a message to start chatting
					</div>
				)}
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${isOwn(msg.sender_id) ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
								isOwn(msg.sender_id)
									? "bg-[var(--color-primary)] text-white rounded-br-md"
									: "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm"
							}`}
						>
							{msg.text}
							<p className={`text-[10px] mt-1 ${isOwn(msg.sender_id) ? "text-white/60" : "text-gray-400"}`}>
								{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="p-3 border-t border-gray-100 dark:border-slate-700">
				<div className="flex gap-2">
					<input
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
						placeholder="Type a message..."
						className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] border border-gray-200 dark:border-slate-600"
					/>
					<button
						onClick={sendMessage}
						disabled={!text.trim() || loading}
						className="bg-[var(--color-primary)] text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-[var(--color-primary-dark)] transition"
					>
						<Send size={18} />
					</button>
				</div>
			</div>
		</div>
	);
}