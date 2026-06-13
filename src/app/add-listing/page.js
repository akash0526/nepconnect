"use client";
import { useEffect, useState, useRef } from "react";
import { supabase, getDeviceId } from "../../lib/supabase";
import {
	Loader2,
	ArrowLeft,
	X,
	Plus,
	Sparkles,
	CheckCircle2,
	Camera,
	MapPin,
	Navigation,
	Image,
	AlertCircle,
	ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
	() => import("../../components/LocationPicker"),
	{
		ssr: false,
		loading: () => (
			<div className="h-44 rounded-2xl skeleton flex items-center justify-center text-xs text-gray-400">
				Loading Map...
			</div>
		),
	},
);

export default function AddListing() {
	const [loading, setLoading] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [aiAnalysis, setAiAnalysis] = useState(null);
	const [gettingLocation, setGettingLocation] = useState(false);
	const router = useRouter();

	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [selectedPos, setSelectedPos] = useState(null);
	const [manualAddress, setManualAddress] = useState("");
	const [showCamera, setShowCamera] = useState(false);
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("Agriculture");
	const [formErrors, setFormErrors] = useState({});

	useEffect(() => {
		return () => previews.forEach((url) => URL.revokeObjectURL(url));
	}, [previews]);

	// Auto AI analysis
	useEffect(() => {
		if (files.length > 0 && !aiAnalysis && !isAnalyzing) {
			runMultiImageAnalysis(files);
		}
	}, [files]);

	const runMultiImageAnalysis = async (filesToAnalyze) => {
		setIsAnalyzing(true);
		try {
			const base64Promises = filesToAnalyze.map((file) => {
				return new Promise((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result.split(",")[1]);
					reader.readAsDataURL(file);
				});
			});
			const base64Images = await Promise.all(base64Promises);
			const res = await fetch("/api/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ images: base64Images }),
			});
			const data = await res.json();
			if (data && !data.error) {
				setAiAnalysis(data);
				if (!title) setTitle(data.title || data.detected_item || "");
				if (!description) {
					setDescription(`${data.description || ""}\n\nAppearance: ${data.appearance || ""}`.trim());
				}
				if (data.category) {
					const validCategories = [
						"Agriculture", "Fashion", "Home Service", "Handmade",
						"Electronics", "Home & Garden", "Toys & Games",
						"Sports & Outdoors", "Beauty & Health",
					];
					if (validCategories.includes(data.category)) setCategory(data.category);
				}
			}
		} catch (err) {
			console.error("AI Analysis failed:", err);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleFileChange = async (e) => {
		const selectedFiles = Array.from(e.target.files);
		await addFiles(selectedFiles);
	};

	const addFiles = async (newFiles) => {
		if (files.length + newFiles.length > 4) {
			alert("Maximum 4 images allowed.");
			return;
		}
		const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
		try {
			const compressedResults = await Promise.all(
				newFiles.map((f) => imageCompression(f, options)),
			);
			const newPreviews = compressedResults.map((f) => URL.createObjectURL(f));
			setFiles((prev) => [...prev, ...compressedResults]);
			setPreviews((prev) => [...prev, ...newPreviews]);
		} catch (error) {
			console.error("Compression error:", error);
		}
	};

	const removeImage = (index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		setPreviews((prev) => prev.filter((_, i) => i !== index));
		if (files.length <= 1) setAiAnalysis(null);
	};

	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser.");
			return;
		}
		setGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setSelectedPos({ lat: position.coords.latitude, lng: position.coords.longitude });
				setGettingLocation(false);
			},
			(error) => {
				console.error("Geolocation error:", error);
				alert("Unable to retrieve your location. Please check permissions.");
				setGettingLocation(false);
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
		);
	};

	const startCamera = async () => {
		setShowCamera(true);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => {
					videoRef.current.play().catch((e) => console.log("Play interrupted:", e));
				};
			}
		} catch (err) {
			alert("Could not access camera. Please allow camera permissions.");
			setShowCamera(false);
		}
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			canvas.toBlob(async (blob) => {
				const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
				await addFiles([file]);
				stopCamera();
			}, "image/jpeg");
		}
	};

	const stopCamera = () => {
		setShowCamera(false);
		if (videoRef.current?.srcObject) {
			videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
		}
	};

	const uploadAllImages = async () => {
		const uploadPromises = files.map(async (fileToUpload) => {
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
			const { error } = await supabase.storage
				.from("listing-images")
				.upload(fileName, fileToUpload);
			if (error) return null;
			const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(fileName);
			return publicUrl;
		});
		const urls = await Promise.all(uploadPromises);
		return urls.filter((url) => url !== null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errors = {};
		if (files.length === 0) errors.photos = "Please add at least one photo";
		if (!title.trim()) errors.title = "Title is required";
		if (!e.target.price.value) errors.price = "Price is required";
		if (!e.target.phone.value) errors.phone = "Phone number is required";
		setFormErrors(errors);
		if (Object.keys(errors).length > 0) return;

		setLoading(true);
		try {
			const imageUrls = await uploadAllImages();
			const { error } = await supabase.from("listings").insert([
				{
					title,
					description,
					price: e.target.price.value,
					phone: e.target.phone.value,
					category,
					image_urls: imageUrls,
					latitude: selectedPos?.lat || null,
					longitude: selectedPos?.lng || null,
					manual_address: manualAddress || null,
					user_id: getDeviceId(),
					ai_detected_item: aiAnalysis?.title || aiAnalysis?.detected_item || null,
					ai_condition_report: aiAnalysis?.condition || null,
					is_verified: aiAnalysis?.condition === "New" || aiAnalysis?.condition === "Like New",
				},
			]);
			if (error) throw error;
			router.push("/");
		} catch (err) {
			alert("Error: " + err.message);
			setLoading(false);
		}
	};

	return (
		<div className="pb-24">
			{/* Header */}
			<div className="bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 rounded-3xl p-6 pt-8 pb-10 text-white shadow-xl -mx-4 mb-6 relative overflow-hidden">
				<div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
				<div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-2">
						<button
							onClick={() => router.back()}
							className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
						>
							<ArrowLeft size={18} className="text-white" />
						</button>
						<h1 className="text-xl font-black">Post an Item</h1>
					</div>
					<p className="text-sm text-white/80 ml-11">
						Snap a photo, AI helps with the rest
					</p>
				</div>
			</div>

			{/* AI Status */}
			<div className="flex items-center justify-end mb-4">
				{isAnalyzing ? (
					<div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 animate-pulse">
						<Loader2 size={14} className="animate-spin" />
						AI Scanning...
					</div>
				) : aiAnalysis ? (
					<div className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/30 px-3.5 py-1.5 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
						<CheckCircle2 size={14} />
						AI Ready
					</div>
				) : null}
			</div>

			{/* Camera Modal */}
			{showCamera && (
				<div className="fixed inset-0 bg-black z-50 flex flex-col">
					<div className="relative flex-1">
						<video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
						<button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 text-white p-2.5 rounded-full">
							<X size={22} />
						</button>
						<div className="absolute bottom-10 left-0 right-0 flex justify-center">
							<button onClick={capturePhoto} className="bg-white p-4 rounded-full shadow-lg active:scale-95 transition-transform">
								<div className="w-14 h-14 rounded-full border-2 border-gray-800" />
							</button>
						</div>
					</div>
					<canvas ref={canvasRef} className="hidden" />
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Photo Grid */}
				<div className="space-y-2">
					<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
						Photos {files.length > 0 && `(${files.length}/4)`}
					</label>
					{formErrors.photos && (
						<p className="text-xs text-red-500 ml-1 flex items-center gap-1">
							<AlertCircle size={12} /> {formErrors.photos}
						</p>
					)}
					<div className="grid grid-cols-2 gap-3">
						{previews.map((url, index) => (
							<div key={index} className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-sm group">
								<img src={url} className="w-full h-full object-cover" alt="" />
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
								>
									<X size={14} />
								</button>
								{index === 0 && (
									<div className="absolute bottom-2 left-2 bg-[var(--color-primary)] text-white text-[9px] font-bold px-2 py-0.5 rounded-lg">
										COVER
									</div>
								)}
							</div>
						))}
						{files.length < 4 && (
							<>
								<label className="aspect-[4/3] bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]">
									<Image size={28} className="text-gray-300" />
									<span className="text-[11px] font-bold text-gray-400 mt-2">Upload</span>
									<input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
								</label>
								<button
									type="button"
									onClick={startCamera}
									className="aspect-[4/3] bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
								>
									<Camera size={28} className="text-gray-300" />
									<span className="text-[11px] font-bold text-gray-400 mt-2">Camera</span>
								</button>
							</>
						)}
					</div>
				</div>

				{/* Form Fields */}
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Item Title</label>
						{formErrors.title && <p className="text-xs text-red-500 ml-1">{formErrors.title}</p>}
						<div className="relative">
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								name="title"
								placeholder="What are you selling?"
								className="input-field pr-10"
								required
							/>
							{aiAnalysis && <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />}
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Description</label>
						<div className="relative">
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								name="description"
								placeholder="Describe your item... (AI will help!)"
								rows={4}
								className="input-field resize-none pr-10"
							/>
							{aiAnalysis && description && (
								<Sparkles size={16} className="absolute right-4 top-4 text-blue-400 pointer-events-none" />
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Price (NPR)</label>
							{formErrors.price && <p className="text-xs text-red-500 ml-1">{formErrors.price}</p>}
							<input
								name="price"
								type="number"
								placeholder="0.00"
								className="input-field"
								required
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Category</label>
							<div className="relative">
								<select
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									name="category"
									className="input-field appearance-none"
								>
									<option>Agriculture</option>
									<option>Fashion</option>
									<option>Home Service</option>
									<option>Handmade</option>
									<option>Electronics</option>
									<option>Home & Garden</option>
									<option>Toys & Games</option>
									<option>Sports & Outdoors</option>
									<option>Beauty & Health</option>
									<option>Other</option>
								</select>
								<ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Contact Number</label>
						{formErrors.phone && <p className="text-xs text-red-500 ml-1">{formErrors.phone}</p>}
						<input
							name="phone"
							type="tel"
							placeholder="98XXXXXXXX"
							className="input-field"
							required
						/>
					</div>
				</div>

				{/* Location Section */}
				<div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MapPin size={18} className="text-[var(--color-primary)]" />
							<h3 className="font-bold text-gray-900 dark:text-gray-100">Location</h3>
						</div>
						<button
							type="button"
							onClick={getCurrentLocation}
							disabled={gettingLocation}
							className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-green-900/30 px-3.5 py-2 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition disabled:opacity-50"
						>
							{gettingLocation ? (
								<Loader2 size={12} className="animate-spin" />
							) : (
								<Navigation size={12} />
							)}
							{gettingLocation ? "Getting..." : "Use Current"}
						</button>
					</div>

					<input
						type="text"
						value={manualAddress}
						onChange={(e) => setManualAddress(e.target.value)}
						placeholder="Enter address or landmark (optional)"
						className="input-field"
					/>

					<div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600">
						<LocationPicker
							onLocationChange={(pos) => setSelectedPos(pos)}
							externalPosition={selectedPos}
						/>
					</div>

					{selectedPos && (
						<p className="text-xs text-gray-500 flex items-center gap-1">
							<MapPin size={12} className="text-green-500" />
							{selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
						</p>
					)}
				</div>

				{/* Submit */}
				<button
					disabled={loading}
					className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-200 dark:shadow-green-900/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
				>
					{loading ? (
						<>
							<Loader2 className="animate-spin" size={20} />
							Publishing...
						</>
					) : (
						<>
							<Plus size={20} />
							Publish Listing
						</>
					)}
				</button>
			</form>
		</div>
	);
}