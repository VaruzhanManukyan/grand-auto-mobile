/**
 * types/repair.types.ts
 */
export type RepairStage = 'accepted' | 'diagnostics' | 'inProgress' | 'done';

export const REPAIR_STAGES: RepairStage[] = ['accepted', 'diagnostics', 'inProgress', 'done'];

export interface RepairSession {
    id: string;
    carId: string;
    carLabel: string;
    locationId: string;
    locationLabel: string;
    mechanicName: string;
    stage: RepairStage;
    serviceLabel: string;
    progress: number; // 0..1
    etaMinutes: number;
}