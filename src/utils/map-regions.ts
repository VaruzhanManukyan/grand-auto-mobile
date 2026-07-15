/**
 * utils/map-regions.ts
 *
 * Fits a map Region around a set of centers — used for the initial
 * "all cities" view and whenever the city filter narrows `centers`
 * down to one city, so the map re-frames itself instead of staying
 * zoomed wherever it happened to be.
 */
import { Region } from 'react-native-maps';
import { ServiceCenter } from '@/types/service.types';

const MIN_DELTA = 0.03;
const PADDING = 0.02;

export function getRegionForCenters(centers: ServiceCenter[]): Region | null {
    if (centers.length === 0) return null;

    const lats = centers.map((c) => c.latitude);
    const lngs = centers.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat + PADDING, MIN_DELTA),
        longitudeDelta: Math.max(maxLng - minLng + PADDING, MIN_DELTA),
    };
}