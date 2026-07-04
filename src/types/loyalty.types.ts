export type LoyaltyLevelId = 'novice' | 'driver' | 'master' | 'schumacher';

export interface LoyaltyLevelConfig {
    id: LoyaltyLevelId;
    order: number;
    color: string;
    minAmount: number;
    maxAmount: number | null;
    bonusPercent: number;
}

export interface LoyaltyUser {
    id: string;
    fullName: string;
    qrValue: string;
    totalBonusesEarned: number;
    currentBonusBalance: number;
}

export interface LoyaltyLevelProgress {
    level: LoyaltyLevelConfig;
    levelIndex: number;
    isMaxLevel: boolean;
    currentValueInLevel: number;
    maxValueInLevel: number;
    progressRatio: number;
    amountToNextLevel: number | null;
}