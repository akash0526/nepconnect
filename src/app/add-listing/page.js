"use client";
import { useEffect, useState } from "react";
import { supabase, getDeviceId } from "../../lib/supabase";
import { Camera, MapPin, Loader2, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression"; // Add this!

export default function AddListing() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const [file, setFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	// Clean up memory when component unmounts
	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const handleFileChange = async (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			// 1. Show preview immediately
			setPreviewUrl(URL.createObjectURL(selectedFile));

			// 2. Compress the image in the background
			const options = {
				maxSizeMB: 0.3, // Compress to ~300KB
				maxWidthOrHeight: 1024,
				useWebWorker: true,
			};

			try {
				const compressed = await imageCompression(selectedFile, options);
				setFile(compressed);
			} catch (error) {
				console.error("Compression failed", error);
				setFile(selectedFile); // Fallback to original
			}
		} else {
			setFile(null);
			setPreviewUrl(null);
		}
	};

	const uploadImage = async (fileToUpload) => {
		if (!fileToUpload) return null;
		const fileExt = fileToUpload.name?.split(".").pop() || "jpg";
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from("listing-images")
			.upload(fileName, fileToUpload);

		if (error) {
			console.error("Upload error:", error);
			return null;
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("listing-images").getPublicUrl(fileName);

		return publicUrl;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		// 1. Get GPS Location First (to ensure we have it)
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const formData = new FormData(e.target);

				// 2. Upload photo while we have location
				const photoUrl = await uploadImage(file);

				// 3. Save to Database
				const { error } = await supabase.from("listings").insert([
					{
						title: formData.get("title"),
						price: formData.get("price"),
						phone: formData.get("phone"),
						category: formData.get("category"),
						image_url: photoUrl,
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
						user_id: getDeviceId(),
					},
				]);

				if (error) {
					alert("Database Error: " + error.message);
				} else {
					router.push("/");
				}
				setLoading(false);
			},
			(err) => {
				alert(
					"Please enable GPS. We need your location so buyers can find you!",
				);
				setLoading(false);
			},
		);
	};

	return (
		<div className="max-w-md mx-auto p-4 pb-20 font-sans">
			<button
				onClick={() => router.back()}
				className="mb-4 flex items-center gap-2 text-gray-600 font-medium"
			>
				<ArrowLeft size={20} /> Back
			</button>
			<h1 className="text-2xl font-bold mb-6 text-gray-800">
				Sell Product or Skill
			</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Modern Photo Upload UI */}
				<div className="relative h-52 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-green-400">
					{previewUrl ? (
						<>
							<img
								src={previewUrl}
								alt="Preview"
								className="absolute inset-0 w-full h-full object-cover"
							/>
							<button
								type="button"
								onClick={() => {
									setFile(null);
									setPreviewUrl(null);
								}}
								className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm"
							>
								<X size={18} />
							</button>
						</>
					) : (
						<div className="text-center p-6">
							<div className="bg-green-50 p-4 rounded-full inline-block mb-3">
								<Camera size={30} className="text-green-600" />
							</div>
							<p className="text-sm font-bold text-gray-700">Add a Photo</p>
							<p className="text-xs text-gray-400 mt-1">
								Take a clear picture of your item
							</p>
						</div>
					)}
					<input
						type="file"
						accept="image/*"
						capture="environment"
						onChange={handleFileChange}
						className="absolute inset-0 opacity-0 cursor-pointer"
					/>
				</div>

				<div className="space-y-1">
					<label className="text-sm font-bold text-gray-700 ml-1">
						Item Name
					</label>
					<input
						name="title"
						placeholder="What are you selling?"
						className="w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<label className="text-sm font-bold text-gray-700 ml-1">
							Price (NPR)
						</label>
						<input
							name="price"
							type="number"
							placeholder="500"
							className="w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>
					<div className="space-y-1">
						<label className="text-sm font-bold text-gray-700 ml-1">
							Category
						</label>
						<select
							name="category"
							className="w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-green-500 appearance-none"
						>
							<option>Agriculture</option>
							<option>Fashion</option>
							<option>Home Service</option>
							<option>Handmade</option>
						</select>
					</div>
				</div>

				<div className="space-y-1">
					<label className="text-sm font-bold text-gray-700 ml-1">
						WhatsApp / Phone
					</label>
					<input
						name="phone"
						type="tel"
						placeholder="98XXXXXXXX"
						className="w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<button
					disabled={loading}
					className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700 active:scale-95 text-white"}`}
				>
					{loading ? (
						<Loader2 className="animate-spin" />
					) : (
						<>
							<MapPin size={20} /> Post Listing Now
						</>
					)}
				</button>
			</form>
		</div>
	);
}
