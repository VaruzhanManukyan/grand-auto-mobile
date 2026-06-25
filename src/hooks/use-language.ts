import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {saveLanguage} from '@/utils/i18n';

export type SupportedLanguage = 'hy' | 'ru' | 'en';

export const LANGUAGE_META: Record<SupportedLanguage, { label: string; sub: string } >= {
    hy: {label: 'Հայերեն', sub: 'Армянский'},
    ru: {label: 'Русский', sub: 'Russian'},
    en: {label: 'English', sub: 'Հայերեն'},
};

export function useLanguage() {
    const {i18n} = useTranslation();
    const [isChanging, setIsChanging] = useState(false);

    const currentLanguage = (i18n.language ?? 'hy') as SupportedLanguage;
    const currentMeta = LANGUAGE_META[currentLanguage] ?? LANGUAGE_META.hy;

    const languages = (Object.keys(LANGUAGE_META) as SupportedLanguage[]).map(code => ({
        code,
        ...LANGUAGE_META[code],
        isActive: code === currentLanguage,
    }));

    const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
        if (lang === currentLanguage || isChanging) return;
        setIsChanging(true);
        try {
            await saveLanguage(lang);
        } finally {
            setIsChanging(false);
        }
    }, [currentLanguage, isChanging]);

    return {
        currentLanguage,
        currentMeta,
        languages,
        isChanging,
        changeLanguage,
    };
}