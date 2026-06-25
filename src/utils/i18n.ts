import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hy from '@/locales/hy.json';
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

const SUPPORTED = ['hy', 'ru', 'en'];
const STORAGE_KEY = 'app:language';

function getSystemLanguage(): string {
    try {
        let raw = '';
        if (Platform.OS === 'ios') {
            raw =
                NativeModules.SettingsManager?.settings?.AppleLocale ||
                NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                '';
        } else {
            raw = NativeModules.I18nManager?.localeIdentifier || '';
        }
        if (!raw) return '';
        const lang = raw.split(/[-_]/)[0].toLowerCase();
        return lang;
    } catch (e) {
        return '';
    }
}

export async function initI18n() {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    let lng: string;

    if (saved && SUPPORTED.includes(saved)) {
        lng = saved;
    } else {
        const sys = getSystemLanguage();
        if (SUPPORTED.includes(sys)) {
            lng = sys;
        } else {
            lng = 'en';
        }
    }

    if (i18n.isInitialized) {
        await i18n.changeLanguage(lng);
        return;
    }

    await i18n.use(initReactI18next).init({
        resources: {
            hy: {translation: hy},
            ru: {translation: ru},
            en: {translation: en},
        },
        lng,
        fallbackLng: 'en',
        interpolation: {escapeValue: false},
    });
}

export async function saveLanguage(lang: string) {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
}

export async function needsLanguagePicker(): Promise<boolean> {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (saved && SUPPORTED.includes(saved)) {
        return false;
    }

    const sys = getSystemLanguage();
    return !SUPPORTED.includes(sys);
}

export default i18n;