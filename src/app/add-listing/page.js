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
	const [gettingLocation, setGettingLocation] = useState(false);
	const router = useRouter();

	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [selectedPos, setSelectedPos] = useState(null);
	const [manualAddress, setManualAddress] = useState("");
	const [showCamera, setShowCamera] = useState(false);
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	// Form states
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("Agriculture");

	useEffect(() => {
		return () => previews.forEach((url) => URL.revokeObjectURL(url));
	}, [previews]);

	// Auto‑trigger AI analysis
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
					const fullDescription = `${data.description || ""}\n\nAppearance: ${data.appearance || ""}`;
					setDescription(fullDescription.trim());
				}
				if (data.category) {
					const validCategories = [
						"Agriculture",
						"Fashion",
						"Home Service",
						"Handmade",
						"Electronics",
						"Home & Garden",
						"Toys & Games",
						"Sports & Outdoors",
						"Beauty & Health",
					];
					if (validCategories.includes(data.category)) {
						setCategory(data.category);
					}
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

		const options = {
			maxSizeMB: 0.2,
			maxWidthOrHeight: 800,
			useWebWorker: true,
		};

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

	// Get current location using Geolocation API
	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser.");
			return;
		}

		setGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setSelectedPos({ lat: latitude, lng: longitude });
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

	// Camera handling
	const startCamera = async () => {
		setShowCamera(true);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => {
					videoRef.current
						.play()
						.catch((e) => console.log("Play interrupted:", e));
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
				const file = new File([blob], `camera-${Date.now()}.jpg`, {
					type: "image/jpeg",
				});
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
					description: description,
					price: e.target.price.value,
					phone: e.target.phone.value,
					category: category,
					image_urls: imageUrls,
					latitude: selectedPos?.lat || null,
					longitude: selectedPos?.lng || null,
					manual_address: manualAddress || null,
					user_id: getDeviceId(),
					ai_detected_item:
						aiAnalysis?.title || aiAnalysis?.detected_item || null,
					ai_condition_report: aiAnalysis?.condition || null,
					is_verified:
						aiAnalysis?.condition === "New" ||
						aiAnalysis?.condition === "Like New",
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

			{/* Camera Modal */}
			{showCamera && (
				<div className="fixed inset-0 bg-black z-50 flex flex-col">
					<div className="relative flex-1">
						<video
							ref={videoRef}
							className="w-full h-full object-cover"
							autoPlay
							playsInline
							muted
						/>
						<button
							onClick={stopCamera}
							className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
						>
							<X size={24} />
						</button>
						<div className="absolute bottom-8 left-0 right-0 flex justify-center">
							<button
								onClick={capturePhoto}
								className="bg-white p-4 rounded-full shadow-lg"
							>
								<div className="w-12 h-12 rounded-full border-2 border-gray-800" />
							</button>
						</div>
					</div>
					<canvas ref={canvasRef} className="hidden" />
				</div>
			)}

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
						<>
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
							<button
								type="button"
								onClick={startCamera}
								className="h-36 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all"
							>
								<Camera size={28} className="text-gray-400" />
								<span className="text-[11px] font-bold text-gray-500 mt-2">
									Take Photo
								</span>
							</button>
						</>
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

					<div className="space-y-1">
						<label className="text-xs font-bold text-gray-500 uppercase ml-1">
							Description
						</label>
						<div className="relative">
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								name="description"
								placeholder="Describe your item... (AI will help!)"
								rows={4}
								className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
							/>
							{aiAnalysis && description && (
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
								<option>Home & Garden</option>
								<option>Toys & Games</option>
								<option>Sports & Outdoors</option>
								<option>Beauty & Health</option>
								<option>Other</option>
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

				{/* Precise Location Section */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MapPin size={18} className="text-green-600" />
							<h3 className="font-bold text-gray-800">Precise Location</h3>
						</div>
						<button
							type="button"
							onClick={getCurrentLocation}
							disabled={gettingLocation}
							className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition"
						>
							{gettingLocation ? (
								<Loader2 size={12} className="animate-spin" />
							) : (
								<Navigation size={12} />
							)}
							{gettingLocation ? "Getting..." : "Use Current Location"}
						</button>
					</div>

					{/* Manual address input */}
					<input
						type="text"
						value={manualAddress}
						onChange={(e) => setManualAddress(e.target.value)}
						placeholder="Enter address or landmark (optional)"
						className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500"
					/>

					{/* Map picker with external position control */}
					<div className="rounded-2xl overflow-hidden border border-gray-200">
						<LocationPicker
							onLocationChange={(pos) => setSelectedPos(pos)}
							externalPosition={selectedPos}
						/>
					</div>
					{selectedPos && (
						<p className="text-xs text-gray-500">
							📍 Coordinates: {selectedPos.lat.toFixed(6)},{" "}
							{selectedPos.lng.toFixed(6)}
						</p>
					)}
				</div>

				<button
					disabled={loading}
					className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
						loading
							? "bg-gray-300 text-gray-500"
							: "bg-green-600 hover:bg-green-700 active:scale-95 text-white shadow-green-200"
					}`}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Publish Listing"}
				</button>
			</form>
		</div>
	);
}
