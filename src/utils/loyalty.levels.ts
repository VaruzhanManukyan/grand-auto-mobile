/**
 * utils/loyalty.levels.ts
 *
 * Pure business logic — level resolution and gauge math.
 * No React, no network, no side effects, so it's trivial to unit test
 * and safe to reuse from the store, a notification handler, etc.
 */

import { LOYALTY_LEVELS } from '@/mocks/loyalty.mock';
import { LoyaltyLevelConfig, LoyaltyLevelProgress } from '@/types/loyalty.types';

// The top level has no ceiling, but the gauge still needs a visual width.
// Reuse the width of the previous band so the "full tank" look stays consistent.
const FALLBACK_BAND_WIDTH = 1_000_000;

export function resolveLoyaltyLevel(totalSpentAmount: number): LoyaltyLevelProgress {
    const levelIndex = LOYALTY_LEVELS.findIndex((level) => {
        const aboveMin = totalSpentAmount >= level.minAmount;
        const belowMax = level.maxAmount === null || totalSpentAmount <= level.maxAmount;
        return aboveMin && belowMax;
    });

    // Negative/corrupt values fall back to level 0 instead of crashing the screen.
    const safeIndex = levelIndex === -1 ? 0 : levelIndex;
    const level = LOYALTY_LEVELS[safeIndex];
    const isMaxLevel = level.maxAmount === null;

    const maxValueInLevel = isMaxLevel ? FALLBACK_BAND_WIDTH : level.maxAmount! - level.minAmount;

    // "Gear shift" behaviour: value inside the level always starts back at 0.
    const rawValueInLevel = totalSpentAmount - level.minAmount;
    const currentValueInLevel = Math.max(0, Math.min(rawValueInLevel, maxValueInLevel));

    return {
        level,
        levelIndex: safeIndex,
        isMaxLevel,
        currentValueInLevel,
        maxValueInLevel,
        progressRatio: maxValueInLevel === 0 ? 0 : currentValueInLevel / maxValueInLevel,
        amountToNextLevel: isMaxLevel ? null : level.maxAmount! - totalSpentAmount + 1,
    };
}

export function getAllLevels(): LoyaltyLevelConfig[] {
    return LOYALTY_LEVELS;
}