import {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {Stack, router, useRootNavigationState} from 'expo-router';
import {I18nextProvider} from 'react-i18next';
import i18n from 'i18next';
import {initMockDB} from '@/mocks/db';
import {initI18n, needsLanguagePicker} from '@/utils/i18n';
import {useAuthStore} from '@/store/auth.store';
import LanguagePicker from '@/components/language-picker';
import {LoadingOverlay} from '@/components/loading';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";

export default function RootLayout() {
    const [appReady, setAppReady] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);
    const isLoading = useAuthStore((s) => s.isLoading);
    const [hasRedirected, setHasRedirected] = useState(false);
    const init = useAuthStore(s => s.init);
    const navState = useRootNavigationState();

    useEffect(() => {
        (async () => {
            await initMockDB();
            await initI18n();
            await init();
            const needsPicker = await needsLanguagePicker();
            setShowLangPicker(true);
            setAppReady(true);
        })();
    }, []);

    useEffect(() => {true
        if (!appReady || showLangPicker || !navState?.key || hasRedirected)
            return;

        setHasRedirected(true);
        router.replace('/(tabs)');
    }, [appReady, showLangPicker, navState?.key, hasRedirected]);

    if (!appReady || isLoading) {
        return (
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 99999,
                }}
            >
                <Stack.Screen options={{ headerShown: false, title: '', animation: 'none' }} />
                <LoadingOverlay visible />
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <I18nextProvider i18n={i18n}>
                    <Stack screenOptions={{headerShown: false}}>
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </I18nextProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}