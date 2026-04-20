"use client";
import { useEffect, useState } from "react";
import { supabase, getDeviceId } from "../../lib/supabase";
import {
	Loader2,
	ArrowLeft,
	X,
	Plus,
	Sparkles,
	CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
	() => import("../../components/LocationPicker"),
	{
		ssr: false,
		loading: () => (
			<div className="h-44 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-400">
				Loading Map...
			</div>
		),
	},
);

export default function AddListing() {
	const [loading, setLoading] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [aiAnalysis, setAiAnalysis] = useState(null);
	const router = useRouter();

	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [selectedPos, setSelectedPos] = useState(null);

	// Form states for AI auto-fill
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("Agriculture");

	useEffect(() => {
		return () => previews.forEach((url) => URL.revokeObjectURL(url));
	}, [previews]);

	// Automatically trigger AI analysis when the user adds the FIRST image
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
				// Auto-fill the form if the user hasn't typed anything yet
				if (!title) setTitle(data.detected_item);
				console.log("AI analysis successful");
			}
		} catch (err) {
			console.error("AI Analysis failed:", err);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleFileChange = async (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (files.length + selectedFiles.length > 4) {
			alert("Maximum 4 images allowed.");
			return;
		}

		const options = {
			maxSizeMB: 0.2,
			maxWidthOrHeight: 800,
			useWebWorker: true,
		};

		try {
			const compressedResults = await Promise.all(
				selectedFiles.map((f) => imageCompression(f, options)),
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

	const uploadAllImages = async () => {
		const uploadPromises = files.map(async (fileToUpload) => {
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
			const { error } = await supabase.storage
				.from("listing-images")
				.upload(fileName, fileToUpload);

			if (error) return null;

			const {
				data: { publicUrl },
			} = supabase.storage.from("listing-images").getPublicUrl(fileName);

			return publicUrl;
		});

		const urls = await Promise.all(uploadPromises);
		return urls.filter((url) => url !== null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (files.length === 0) {
			alert("Please add at least one photo.");
			return;
		}

		setLoading(true);
		try {
			const imageUrls = await uploadAllImages();

			const { error } = await supabase.from("listings").insert([
				{
					title: title,
					price: e.target.price.value,
					phone: e.target.phone.value,
					category: category,
					image_urls: imageUrls,
					latitude: selectedPos?.lat || null,
					longitude: selectedPos?.lng || null,
					user_id: getDeviceId(),
					ai_detected_item: aiAnalysis?.detected_item || null,
					ai_condition_report: aiAnalysis?.condition_assessment || null,
					ai_condition_score: aiAnalysis?.condition_score || null,
					is_verified: aiAnalysis?.is_safe || false,
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
		<div className="max-w-md mx-auto p-4 pb-20 font-sans bg-white min-h-screen">
			<button
				onClick={() => router.back()}
				className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
			>
				<ArrowLeft size={20} /> <span className="font-medium">Back</span>
			</button>

			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Post an Item</h1>
				{isAnalyzing ? (
					<div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
						<Loader2 size={14} className="animate-spin" />
						<span className="text-[10px] font-bold uppercase">Scanning...</span>
					</div>
				) : (
					aiAnalysis && (
						<div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
							<CheckCircle2 size={14} />
							<span className="text-[10px] font-bold uppercase">AI Ready</span>
						</div>
					)
				)}
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Photo Grid */}
				<div className="grid grid-cols-2 gap-3">
					{previews.map((url, index) => (
						<div
							key={index}
							className="relative h-36 bg-gray-100 rounded-2xl overflow-hidden shadow-sm"
						>
							<img
								src={url}
								className="w-full h-full object-cover"
								alt="Preview"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-md"
							>
								<X size={14} />
							</button>
							{index === 0 && (
								<div className="absolute bottom-2 left-2 bg-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg">
									COVER PHOTO
								</div>
							)}
						</div>
					))}
					{files.length < 4 && (
						<label className="h-36 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
							<Plus size={28} className="text-gray-400" />
							<span className="text-[11px] font-bold text-gray-500 mt-2">
								Add Photo
							</span>
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleFileChange}
								className="hidden"
							/>
						</label>
					)}
				</div>

				{/* Form Inputs */}
				<div className="space-y-4">
					<div className="space-y-1">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">
							Item Title
						</label>
						<div className="relative">
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								name="title"
								placeholder="What are you selling?"
								className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all"
								required
							/>
							{aiAnalysis && (
								<Sparkles
									size={18}
									className="absolute right-4 top-4 text-blue-400 pointer-events-none"
								/>
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label className="text-xs font-bold text-gray-500 uppercase ml-1">
								Price (NPR)
							</label>
							<input
								name="price"
								type="number"
								placeholder="0.00"
								className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-bold text-gray-500 uppercase ml-1">
								Category
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								name="category"
								className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 appearance-none"
							>
								<option>Agriculture</option>
								<option>Fashion</option>
								<option>Home Service</option>
								<option>Handmade</option>
								<option>Electronics</option>
							</select>
						</div>
					</div>

					<div className="space-y-1">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">
							Contact Number
						</label>
						<input
							name="phone"
							type="tel"
							placeholder="98XXXXXXXX"
							className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-xs font-bold text-gray-500 uppercase ml-1">
						Item Location
					</label>
					<LocationPicker onLocationChange={(pos) => setSelectedPos(pos)} />
				</div>

				<button
					disabled={loading}
					className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${loading ? "bg-gray-300 text-gray-500" : "bg-green-600 hover:bg-green-700 active:scale-95 text-white shadow-green-200"}`}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Publish Listing"}
				</button>
			</form>
		</div>
	);
}
