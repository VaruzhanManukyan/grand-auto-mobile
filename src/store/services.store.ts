/**
 * store/services.store.ts
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import { ServiceCenter, ServiceType } from '@/types/service.types';
import { fetchServiceCenters } from '@/services/service.service';

interface ServicesState {
    centers: ServiceCenter[];
    selectedCenterId: string | null;
    selectedCity: string | null; // null = "Все города"
    selectedServices: ServiceType[]; // [] = no service filter applied
    /** The rating (1–5) each center id was given by this user, if any. */
    userRatings: Record<string, number>;
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    refresh: () => Promise<void>;
    selectCenter: (id: string | null) => void;
    selectCity: (city: string | null) => void;
    toggleService: (service: ServiceType) => void;
    resetServices: () => void;
    rateCenter: (centerId: string, rating: number) => void;
}

async function load(
    set: (partial: Partial<ServicesState>) => void,
): Promise<void> {
    set({ isLoading: true, error: null });
    try {
        const centers = await fetchServiceCenters();
        set({ centers, isLoading: false });
    } catch {
        set({ error: 'Не удалось загрузить сервисные центры', isLoading: false });
    }
}

export const useServicesStore = create<ServicesState>((set, get) => ({
    centers: [],
    selectedCenterId: null,
    selectedCity: null,
    selectedServices: [],
    userRatings: {},
    isLoading: false,
    error: null,
    fetch: () => load(set),
    refresh: () => load(set),
    selectCenter: (id) => set({ selectedCenterId: id }),
    selectCity: (city) => set({ selectedCity: city, selectedCenterId: null }),
    toggleService: (service) => {
        const current = get().selectedServices;
        const next = current.includes(service)
            ? current.filter((s) => s !== service)
            : [...current, service];
        set({ selectedServices: next, selectedCenterId: null });
    },
    resetServices: () => set({ selectedServices: [], selectedCenterId: null }),
    // Local-only, optimistic: folds the new rating into the center's
    // displayed average right away. There's no backend wired up here —
    // once you have a "submit rating" endpoint, call it here and then
    // resolve `centers`/`userRatings` from its response instead.
    rateCenter: (centerId, rating) => {
        const centers = get().centers.map((c) => {
            if (c.id !== centerId) return c;
            const priorCount = c.ratingCount ?? 0;
            const priorAverage = c.rating ?? 0;
            const nextCount = priorCount + 1;
            const nextAverage = (priorAverage * priorCount + rating) / nextCount;
            return { ...c, rating: Math.round(nextAverage * 10) / 10, ratingCount: nextCount };
        });
        set({ centers, userRatings: { ...get().userRatings, [centerId]: rating } });
    },
}));

/**
 * Convenience selector — the currently selected center, or null.
 * Safe as a plain selector: .find() returns the actual element
 * reference from `centers` (or null), never a newly-created object,
 * so it doesn't retrigger renders on its own.
 */
export const useSelectedCenter = (): ServiceCenter | null =>
    useServicesStore((s) => s.centers.find((c) => c.id === s.selectedCenterId) ?? null);

/**
 * Centers narrowed down to the selected city and to the selected
 * service types (if any), or all of them if no filters are active.
 *
 * A center matches the services filter only if it offers EVERY
 * currently-selected service type — i.e. "washing" + "oil_change"
 * selected together returns only centers that do both, not either.
 *
 * Subscribes to `centers`, `selectedCity` and `selectedServices` as
 * plain (stable) selectors, then derives the filtered list with
 * useMemo — NOT by running .filter() directly inside a zustand
 * selector, which would hand back a brand-new array reference on
 * every single render and cause the exact "Maximum update depth
 * exceeded" loop this had.
 */
export const useFilteredCenters = (): ServiceCenter[] => {
    const centers = useServicesStore((s) => s.centers);
    const selectedCity = useServicesStore((s) => s.selectedCity);
    const selectedServices = useServicesStore((s) => s.selectedServices);

    return useMemo(() => {
        let result = selectedCity ? centers.filter((c) => c.city === selectedCity) : centers;

        if (selectedServices.length > 0) {
            result = result.filter((c) => selectedServices.every((s) => c.services.includes(s)));
        }

        return result;
    }, [centers, selectedCity, selectedServices]);
};

/**
 * Distinct city names present in the data, for the filter bar's chip
 * list. Same fix as above: derive via useMemo keyed on `centers`,
 * not inline inside the zustand selector.
 */
export const useCityList = (): string[] => {
    const centers = useServicesStore((s) => s.centers);
    return useMemo(() => Array.from(new Set(centers.map((c) => c.city))).sort(), [centers]);
};