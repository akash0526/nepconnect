"use client";
import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
	const [lang, setLang] = useState("ne"); // default Nepali

	const toggleLanguage = () => {
		setLang((prev) => (prev === "ne" ? "en" : "ne"));
	};

	return (
		<LanguageContext.Provider value={{ lang, toggleLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
}
