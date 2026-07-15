/**
 * plugins/with-map-queries.js
 *
 * Adds the Android <queries> entries the navigation-app picker needs
 * to detect Google Maps / Waze / Yandex Navigator — Android 11+
 * hides package visibility by default (developer.android.com/
 * training/package-visibility), so without this, canOpenURL() just
 * returns false for all of them and the picker only shows the web
 * fallback.
 *
 * Register in app.json:
 *   "plugins": ["./plugins/with-map-queries.js"]
 *
 * Then run `npx expo prebuild` (or a new EAS build) — this only
 * takes effect on a native build, not in Expo Go.
 *
 * iOS needs a separate, simpler step — no plugin required, just add
 * to app.json:
 *   "ios": {
 *     "infoPlist": {
 *       "LSApplicationQueriesSchemes": ["comgooglemaps", "waze", "yandexnavi"]
 *     }
 *   }
 * (maps:// is Apple's own scheme and doesn't need whitelisting.)
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PACKAGES = [
    'com.google.android.apps.maps',
    'com.waze',
    'ru.yandex.yandexnavi',
];

module.exports = function withMapQueries(config) {
    return withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        manifest.queries = manifest.queries || [{}];
        manifest.queries[0].package = PACKAGES.map((name) => ({
            $: { 'android:name': name },
        }));
        return config;
    });
};