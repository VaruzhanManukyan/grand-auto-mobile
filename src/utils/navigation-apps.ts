/**
 * utils/navigation-apps.ts
 *
 * Detects which navigation apps are actually installed on the device
 * and lets the user pick one, instead of always hard-opening Google
 * Maps. Apple Maps (iOS) is always available since it's a built-in
 * OS scheme — the rest (Google Maps, Waze, Yandex Navigator) need to
 * be probed via Linking.canOpenURL().
 *
 * IMPORTANT: canOpenURL() only sees these apps if you declare the
 * schemes/packages up front — see plugins/with-map-queries.js for
 * Android, and the LSApplicationQueriesSchemes note below for iOS.
 * Without that config, canOpenURL() silently returns false for all
 * of them and the picker will only ever show the web fallback.
 */
import { Linking, Platform } from 'react-native';
import { ServiceCenter } from '@/types/service.types';

export interface NavigationApp {
    id: string;
    label: string;
    getUrl: (center: ServiceCenter) => string;
}

const WEB_FALLBACK: NavigationApp = {
    id: 'web',
    label: 'Google Maps (браузер)',
    getUrl: (c) => `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`,
};

// probeUrl is only used to check installation — getUrl builds the real link
const CANDIDATES: (NavigationApp & { probeUrl: string; platforms?: Array<'ios' | 'android'> })[] = [
    {
        id: 'apple',
        label: 'Apple Карты',
        platforms: ['ios'],
        probeUrl: 'maps://',
        getUrl: (c) => `maps://app?daddr=${c.latitude},${c.longitude}&dirflg=d`,
    },
    {
        id: 'google',
        label: 'Google Карты',
        probeUrl: Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:q=0,0',
        getUrl: (c) =>
            Platform.OS === 'ios'
                ? `comgooglemaps://?daddr=${c.latitude},${c.longitude}&directionsmode=driving`
                : `google.navigation:q=${c.latitude},${c.longitude}`,
    },
    {
        id: 'waze',
        label: 'Waze',
        probeUrl: 'waze://',
        getUrl: (c) => `waze://?ll=${c.latitude},${c.longitude}&navigate=yes`,
    },
    {
        id: 'yandex',
        label: 'Яндекс Навигатор',
        probeUrl: 'yandexnavi://',
        getUrl: (c) => `yandexnavi://build_route_on_map?lat_to=${c.latitude}&lon_to=${c.longitude}`,
    },
];

export async function getAvailableNavigationApps(): Promise<NavigationApp[]> {
    const results = await Promise.all(
        CANDIDATES.map(async ({ platforms, probeUrl, ...app }) => {
            if (platforms && !platforms.includes(Platform.OS as 'ios' | 'android')) return null;
            try {
                return (await Linking.canOpenURL(probeUrl)) ? app : null;
            } catch {
                return null;
            }
        }),
    );
    const available = results.filter((a): a is NavigationApp => a !== null);
    return available.length > 0 ? available : [WEB_FALLBACK];
}

export async function openWithApp(app: NavigationApp, center: ServiceCenter): Promise<void> {
    try {
        await Linking.openURL(app.getUrl(center));
    } catch {
        await Linking.openURL(WEB_FALLBACK.getUrl(center));
    }
}