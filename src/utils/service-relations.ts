/**
 * utils/service-relations.ts
 *
 * cars.mock and repairs.mock are NOT merged into one file — a car
 * doesn't always have an active repair, and a repair record doesn't
 * belong on the Car type. Instead these are small join selectors,
 * the same relationship SQL foreign keys would express:
 *
 *   Car (by id) --< RepairSession (by carId) >-- ServiceCenter (by locationId)
 */
import { mockActiveRepairs } from '@/mocks/repairs.mock';
import { mockServiceCenters } from '@/mocks/service.mock';
import { Car } from '@/types/cars.types';
import { RepairSession } from '@/types/repair.types';
import { ServiceCenter } from '@/types/service.types';

/** The active repair for a car, or null if it isn't currently in service. */
export function getActiveRepairForCar(carId: Car['id']): RepairSession | null {
    return mockActiveRepairs.find((r) => r.carId === carId) ?? null;
}

/** The service center a given repair session is happening at. */
export function getCenterForRepair(repair: RepairSession): ServiceCenter | null {
    return mockServiceCenters.find((c) => c.id === repair.locationId) ?? null;
}

/** Convenience: the center a car is at right now, or null if it's not in service. */
export function getCenterForCar(carId: Car['id']): ServiceCenter | null {
    const repair = getActiveRepairForCar(carId);
    return repair ? getCenterForRepair(repair) : null;
}

/** All repairs currently in progress at a center — powers the "N cars in service" badge on its card. */
export function getActiveRepairsForCenter(centerId: ServiceCenter['id']): RepairSession[] {
    return mockActiveRepairs.filter((r) => r.locationId === centerId);
}