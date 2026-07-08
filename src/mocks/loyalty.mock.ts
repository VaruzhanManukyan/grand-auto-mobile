import {LoyaltyLevelConfig, LoyaltyUser} from '@/types/loyalty.types';

export const LOYALTY_LEVELS: LoyaltyLevelConfig[] = [
    {id: 'novice', order: 1, color: '#00FF88', minAmount: 0, maxAmount: 149_999, bonusPercent: 3},
    {id: 'driver', order: 2, color: '#FF9F43', minAmount: 150_000, maxAmount: 499_999, bonusPercent: 5},
    {id: 'master', order: 3, color: '#FF003C', minAmount: 500_000, maxAmount: 1_499_999, bonusPercent: 7},
    {id: 'schumacher', order: 4, color: '#F1C40F', minAmount: 1_500_000, maxAmount: null, bonusPercent: 10},
];

export const mockLoyaltyUser: LoyaltyUser = {
    id: 'usr_1001',
    fullName: 'Վարուժան Մելիքյան',
    qrValue: 'GRANDAUTO:usr_1001:LOYALTY',
    totalBonusesEarned: 345000,
    currentBonusBalance: 30000,
};