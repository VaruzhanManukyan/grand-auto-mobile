/**
 * store/services.store.ts
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import { ServiceCenter } from '@/types/service.types';
import { fetchServiceCenters } from '@/services/service.service';

interface ServicesState {
    centers: ServiceCenter[];
    selectedCenterId: string | null;
    selectedCity: string | null; // null = "Все города"
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    refresh: () => Promise<void>;
    selectCenter: (id: string | null) => void;
    selectCity: (city: string | null) => void;
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

export const useServicesStore = create<ServicesState>((set) => ({
    centers: [],
    selectedCenterId: null,
    selectedCity: null,
    isLoading: false,
    error: null,
    fetch: () => load(set),
    refresh: () => load(set),
    selectCenter: (id) => set({ selectedCenterId: id }),
    selectCity: (city) => set({ selectedCity: city, selectedCenterId: null }),
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
 * Centers narrowed down to the selected city, or all of them if
 * "Все города" is active.
 *
 * Subscribes to `centers` and `selectedCity` as two plain (stable)
 * selectors, then derives the filtered list with useMemo — NOT by
 * running .filter() directly inside a zustand selector, which would
 * hand back a brand-new array reference on every single render and
 * cause the exact "Maximum update depth exceeded" loop this had.
 */
export const useFilteredCenters = (): ServiceCenter[] => {
    const centers = useServicesStore((s) => s.centers);
    const selectedCity = useServicesStore((s) => s.selectedCity);
    return useMemo(
        () => (selectedCity ? centers.filter((c) => c.city === selectedCity) : centers),
        [centers, selectedCity],
    );
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