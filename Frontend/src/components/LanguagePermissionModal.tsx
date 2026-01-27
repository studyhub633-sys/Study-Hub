import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguagePermissionModal() {
    const { t } = useTranslation();
    const {
        showPermissionModal,
        detectedLanguage,
        acceptDetectedLanguage,
        declineDetectedLanguage,
        getLanguageInfo,
    } = useLanguage();
    const [dontAskAgain, setDontAskAgain] = useState(false);

    if (!showPermissionModal || !detectedLanguage) {
        return null;
    }

    const langInfo = getLanguageInfo(detectedLanguage);
    const languageName = langInfo?.nativeName || langInfo?.name || detectedLanguage;

    return (
        <AlertDialog open={showPermissionModal}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            {t('languageModal.title')}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        {t('languageModal.description', { language: languageName })}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex items-center space-x-2 py-4">
                    <Checkbox
                        id="dontAskAgain"
                        checked={dontAskAgain}
                        onCheckedChange={(checked) => setDontAskAgain(checked as boolean)}
                    />
                    <label
                        htmlFor="dontAskAgain"
                        className="text-sm text-muted-foreground cursor-pointer"
                    >
                        {t('languageModal.dontAskAgain')}
                    </label>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel
                        onClick={() => declineDetectedLanguage(dontAskAgain)}
                        className="w-full sm:w-auto"
                    >
                        {t('languageModal.keepCurrent')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={acceptDetectedLanguage}
                        className="w-full sm:w-auto"
                    >
                        <span className="mr-2">{langInfo?.flag}</span>
                        {t('languageModal.switchTo', { language: languageName })}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
