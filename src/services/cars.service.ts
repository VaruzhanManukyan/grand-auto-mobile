/**
 * services/cars.types.ts
 *
 * Everything above this file (store, UI) only ever talks to carsService.
 * Right now it resolves from mocks; later, each method's body becomes
 * an `api.get(...)` call and nothing else in the app has to change.
 */
import { simulateLatency } from '@/utils/simulate-latency';
import { mockCars } from '@/mocks/cars.mock';
import { Car } from '@/types/cars.types';

export const carsService = {
    async getUserCars(): Promise<Car[]> {
        await simulateLatency();
        // TODO: return api.get<Car[]>('/cars');
        return [...mockCars];
    },
};