import { useState } from "react";

export default function LocationModal({ lang, location, onClose, onSave }) {
	const [lat, setLat] = useState(location.lat);
	const [lng, setLng] = useState(location.lng);

	const handleSave = () => {
		onSave(lat, lng);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl p-4 w-full max-w-sm">
				<h3 className="font-bold mb-2">
					{lang === "ne" ? "निर्देशांक प्रविष्ट गर्नुहोस्" : "Enter Coordinates"}
				</h3>
				<div className="flex gap-2">
					<input
						type="number"
						placeholder={lang === "ne" ? "अक्षांश" : "Latitude"}
						value={lat}
						onChange={(e) => setLat(parseFloat(e.target.value))}
						className="flex-1 p-2 border rounded-xl"
					/>
					<input
						type="number"
						placeholder={lang === "ne" ? "देशान्तर" : "Longitude"}
						value={lng}
						onChange={(e) => setLng(parseFloat(e.target.value))}
						className="flex-1 p-2 border rounded-xl"
					/>
				</div>
				<button
					onClick={handleSave}
					className="mt-3 w-full bg-green-600 text-white py-2 rounded-xl"
				>
					{lang === "ne" ? "ठिक छ" : "Done"}
				</button>
			</div>
		</div>
	);
}
