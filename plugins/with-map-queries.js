/**
 * plugins/with-map-queries.js
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PACKAGES = [
    'com.google.android.apps.maps',
    'com.waze',
    'ru.yandex.yandexnavi',
    'ru.yandex.yandexmaps',
    'ru.dublgis.dgismobile'
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