import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import hi from '@/locales/hi.json';
import it from '@/locales/it.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import nl from '@/locales/nl.json';
import pt from '@/locales/pt.json';
import ru from '@/locales/ru.json';
import zhCN from '@/locales/zh-CN.json';
import zhTW from '@/locales/zh-TW.json';

// Language configuration
export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

// Get language info by code
export const getLanguageByCode = (code: string) => {
    return languages.find((lang) => lang.code === code) || languages[0];
};

// Map browser/geolocation language codes to our supported languages
export const mapBrowserLanguage = (browserLang: string): LanguageCode => {
    const lang = browserLang.toLowerCase();

    // Direct matches
    if (lang === 'zh-cn' || lang === 'zh-hans') return 'zh-CN';
    if (lang === 'zh-tw' || lang === 'zh-hant' || lang === 'zh-hk') return 'zh-TW';

    // Prefix matches
    const prefix = lang.split('-')[0];
    const match = languages.find((l) => l.code === prefix || l.code.split('-')[0] === prefix);

    return (match?.code || 'en') as LanguageCode;
};

// Resources for i18n
const resources = {
    en: { translation: en },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    ja: { translation: ja },
    ru: { translation: ru },
    pt: { translation: pt },
    hi: { translation: hi },
    ar: { translation: ar },
    ko: { translation: ko },
    it: { translation: it },
    nl: { translation: nl },
};

// Initialize i18n
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,

        interpolation: {
            escapeValue: false, // React already escapes by default
        },

        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator', 'htmlTag'],
            // Cache user language in localStorage
            caches: ['localStorage'],
            // Key to store in localStorage
            lookupLocalStorage: 'revizely-language',
        },
    });

export default i18n;
