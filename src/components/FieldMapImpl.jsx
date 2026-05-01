"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the actual map – this ensures leaflet is never loaded on the server.
const FieldMapImpl = dynamic(() => import("./FieldMapImpl"), {
	ssr: false,
});

export default function FieldMap(props) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div className="h-[400px] w-full bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">
				Loading map...
			</div>
		);
	}

	return <FieldMapImpl {...props} />;
}
