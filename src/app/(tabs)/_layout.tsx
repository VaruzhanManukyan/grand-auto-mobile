import { StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import AuthScreen from '@/components/auth-screen';
import { useAuthStore } from '@/store/auth.store';
import {RepairMiniPlayerRoot} from "@/components/repair-mini-player/repair-mini-player-root";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const user = useAuthStore(s => s.user);

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppTabs />
            <RepairMiniPlayerRoot />
            <AnimatedSplashOverlay />

            {!user && (
                <View style={StyleSheet.absoluteFill}>
                    <AuthScreen />
                </View>
            )}
        </ThemeProvider>
    );
}