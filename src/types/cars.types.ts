/**
 * types/car.types.ts
 *
 * A car owned by the user. `status` is a coarse summary used on the
 * home screen — the detailed repair record lives in repair.types.ts.
 */
export type CarStatus = 'in_service' | 'ok';

export interface Car {
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    status: CarStatus;
}