"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
	const [lang, setLang] = useState("ne");

	// Load saved preference on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem("nepconnect_lang");
			if (saved === "en" || saved === "ne") setLang(saved);
		} catch {}
	}, []);

	const toggleLanguage = () => {
		const next = lang === "ne" ? "en" : "ne";
		setLang(next);
		try {
			localStorage.setItem("nepconnect_lang", next);
		} catch {}
	};

	return (
		<LanguageContext.Provider value={{ lang, toggleLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
}