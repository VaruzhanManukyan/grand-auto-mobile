/**
 * utils/navigation-apps.ts
 *
 * Detects which navigation apps are actually installed on the device
 * and lets the user pick one, instead of always hard-opening Google
 * Maps.
 */
import { Linking, Platform } from 'react-native';
import { ServiceCenter } from '@/types/service.types';

export interface NavigationApp {
    id: string;
    labelKey: string;
    getUrl: (center: ServiceCenter) => string;
}

const WEB_FALLBACK: NavigationApp = {
    id: 'web',
    labelKey: 'services.navApps.web',
    getUrl: (c) => `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`,
};

const CANDIDATES: (NavigationApp & { probeUrl: string; platforms?: Array<'ios' | 'android'> })[] = [
    {
        id: 'apple',
        labelKey: 'services.navApps.apple',
        platforms: ['ios'],
        probeUrl: 'maps://',
        getUrl: (c) => `maps://app?daddr=${c.latitude},${c.longitude}&dirflg=d`,
    },
    {
        id: 'google',
        labelKey: 'services.navApps.google',
        probeUrl: Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:q=0,0',
        getUrl: (c) =>
            Platform.OS === 'ios'
                ? `comgooglemaps://?daddr=${c.latitude},${c.longitude}&directionsmode=driving`
                : `google.navigation:q=${c.latitude},${c.longitude}`,
    },
    {
        id: 'waze',
        labelKey: 'services.navApps.waze',
        probeUrl: 'waze://',
        getUrl: (c) => `waze://?ll=${c.latitude},${c.longitude}&navigate=yes`,
    },
    {
        id: 'yandex',
        labelKey: 'services.navApps.yandex',
        probeUrl: 'yandexnavi://',
        getUrl: (c) => `yandexnavi://build_route_on_map?lat_to=${c.latitude}&lon_to=${c.longitude}`,
    },
    {
        id: 'yandex_maps',
        labelKey: 'services.navApps.yandex_maps',
        probeUrl: 'yandexmaps://',
        getUrl: (c) => `yandexmaps://maps.yandex.ru/?rtext=~${c.latitude},${c.longitude}&rtt=auto`,
    },
    {
        id: 'dgis',
        labelKey: 'services.navApps.dgis',
        probeUrl: 'dgis://',
        getUrl: (c) => `dgis://2gis.ru/routeSearch/rsType/car/to/${c.longitude},${c.latitude}`,
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