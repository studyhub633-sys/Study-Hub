import { getLanguageByCode, LanguageCode, languages, mapBrowserLanguage } from '@/lib/i18n';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
    currentLanguage: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    languages: typeof languages;
    showPermissionModal: boolean;
    detectedLanguage: LanguageCode | null;
    acceptDetectedLanguage: () => void;
    declineDetectedLanguage: (dontAskAgain?: boolean) => void;
    getLanguageInfo: (code: string) => ReturnType<typeof getLanguageByCode>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const PERMISSION_DECLINED_KEY = 'scientia-language-permission-declined';
const LANGUAGE_PROMPTED_KEY = 'scientia-language-prompted';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
        (i18n.language as LanguageCode) || 'en'
    );
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode | null>(null);

    // Check for geolocation-based language suggestion on first visit
    useEffect(() => {
        const hasBeenPrompted = localStorage.getItem(LANGUAGE_PROMPTED_KEY);
        const hasDeclined = localStorage.getItem(PERMISSION_DECLINED_KEY);
        const savedLanguage = localStorage.getItem('scientia-language');

        // Don't prompt if user has already chosen a language or declined
        if (hasBeenPrompted || hasDeclined || savedLanguage) {
            return;
        }

        // Get browser's preferred language
        const browserLang = navigator.language || (navigator as any).userLanguage;
        const mappedLang = mapBrowserLanguage(browserLang);

        // Only prompt if detected language is different from English
        if (mappedLang !== 'en') {
            setDetectedLanguage(mappedLang);
            setShowPermissionModal(true);
        }

        // Mark that we've checked
        localStorage.setItem(LANGUAGE_PROMPTED_KEY, 'true');
    }, []);

    const setLanguage = (code: LanguageCode) => {
        i18n.changeLanguage(code);
        setCurrentLanguage(code);
        localStorage.setItem('scientia-language', code);

        // Update document direction for RTL languages
        const langInfo = getLanguageByCode(code);
        document.documentElement.dir = langInfo && 'rtl' in langInfo && langInfo.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = code;
    };

    const acceptDetectedLanguage = () => {
        if (detectedLanguage) {
            setLanguage(detectedLanguage);
        }
        setShowPermissionModal(false);
        setDetectedLanguage(null);
    };

    const declineDetectedLanguage = (dontAskAgain = false) => {
        if (dontAskAgain) {
            localStorage.setItem(PERMISSION_DECLINED_KEY, 'true');
        }
        setShowPermissionModal(false);
        setDetectedLanguage(null);
        // Set English as the chosen language
        setLanguage('en');
    };

    const getLanguageInfo = (code: string) => getLanguageByCode(code);

    // Sync with i18n language changes
    useEffect(() => {
        const handleLanguageChange = (lng: string) => {
            setCurrentLanguage(lng as LanguageCode);
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    return (
        <LanguageContext.Provider
            value={{
                currentLanguage,
                setLanguage,
                languages,
                showPermissionModal,
                detectedLanguage,
                acceptDetectedLanguage,
                declineDetectedLanguage,
                getLanguageInfo,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
