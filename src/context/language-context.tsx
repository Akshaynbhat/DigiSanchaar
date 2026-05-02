"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';

// --- Static Imports for Translations ---
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';
import ml from '@/locales/ml.json';
import bn from '@/locales/bn.json';
import mr from '@/locales/mr.json';
import gu from '@/locales/gu.json';
import pa from '@/locales/pa.json';
import as from '@/locales/as.json';


export const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'অসমীয়া' },
];

type Translations = { [key: string]: string };

// --- Map of all statically imported translations ---
const allTranslations: Record<string, Translations> = {
    en, hi, kn, ta, te, ml, bn, mr, gu, pa, as
};


type LanguageContextType = {
    language: string;
    setLanguage: (language: string) => void;
    t: (key: string, replacements?: Record<string, string>) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState('en');
    const [translations, setTranslations] = useState<Translations>({});

    const loadTranslations = useCallback((lang: string) => {
        const selectedTranslations = allTranslations[lang] || allTranslations['en'];
        setTranslations(selectedTranslations);
    }, []);

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        const storedLang = localStorage.getItem('language');
        const initialLang = storedLang && LANGUAGES.some(l => l.code === storedLang) 
            ? storedLang 
            : LANGUAGES.some(l => l.code === browserLang) 
            ? browserLang 
            : 'en';
        
        setLanguageState(initialLang);
        loadTranslations(initialLang);
    }, [loadTranslations]);

    const setLanguage = (lang: string) => {
        if (LANGUAGES.some(l => l.code === lang)) {
            setLanguageState(lang);
            localStorage.setItem('language', lang);
            loadTranslations(lang);
        }
    };

    const t = useCallback((key: string, replacements?: Record<string, string>): string => {
        let translation = translations[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(`{${rKey}}`, replacements[rKey]);
            });
        }
        return translation;
    }, [translations]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {Object.keys(translations).length > 0 ? children : null}
        </LanguageContext.Provider>
    );
};
