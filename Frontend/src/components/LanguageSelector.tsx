import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
    const { t } = useTranslation();
    const { currentLanguage, setLanguage, languages, getLanguageInfo } = useLanguage();
    const currentLangInfo = getLanguageInfo(currentLanguage);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label={t('languageSelector.selectLanguage')}
                >
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center gap-2 cursor-pointer ${currentLanguage === lang.code ? 'bg-accent' : ''
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="flex-1">{lang.nativeName}</span>
                        {currentLanguage === lang.code && (
                            <span className="text-xs text-muted-foreground">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
