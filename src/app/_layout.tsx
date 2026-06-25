import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

import { initMockDB } from '@/mock/db';
import { initI18n, needsLanguagePicker } from '@/utils/i18n';
import { useAuthStore } from '@/store/auth.store';
import LanguagePicker from '@/components/language-picker';
import { LoadingOverlay } from "@/components/loading";

export default function RootLayout() {
    const [appReady, setAppReady] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);

    const init = useAuthStore(s => s.init);
    const user = useAuthStore(s => s.user);

    useEffect(() => {
        (async () => {
            await initMockDB();
            await initI18n();
            await init();

            const needsPicker = await needsLanguagePicker();
            setShowLangPicker(needsPicker);
            setAppReady(true);
        })();
    }, []);

    useEffect(() => {
        if (!appReady || showLangPicker) return;
        if (user) {
            router.replace('/(tabs)');
        } else {
            router.replace('/(tabs)');
        }
    }, [appReady, user, showLangPicker]);

    if (!appReady) {
        return (
            <View>
                <LoadingOverlay visible={!appReady} />
            </View>
        );
    }

    if (showLangPicker) {
        return (
            <I18nextProvider i18n={i18n}>
                <LanguagePicker onSelect={() => setShowLangPicker(false)}/>
            </I18nextProvider>
        );
    }

    return (
        <I18nextProvider i18n={i18n}>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="(tabs)"/>
            </Stack>
        </I18nextProvider>
    );
}