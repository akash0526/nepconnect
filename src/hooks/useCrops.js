import { useState } from "react";

export function useCrops() {
	const [search, setSearch] = useState("");
	const [results, setResults] = useState([]);
	const [selectedCrop, setSelectedCrop] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const searchCrops = async () => {
		if (!search.trim()) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`https://openfarm.cc/api/v1/crops?filter=${search}`,
			);
			const data = await res.json();
			setResults(data.data || []);
			setSelectedCrop(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const getCropDetails = async (crop) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`https://openfarm.cc/api/v1/crops/${crop.id}`);
			const data = await res.json();
			setSelectedCrop(data.data);
			setResults([]);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const clearCrop = () => setSelectedCrop(null);

	return {
		search,
		setSearch,
		results,
		selectedCrop,
		loading,
		error,
		searchCrops,
		getCropDetails,
		clearCrop,
	};
}
