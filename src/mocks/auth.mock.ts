/**
 * mock/auth.mock.ts
 *
 * All mock-specific logic: OTP store, fake token generation, social test users.
 * When you switch to a real backend → DELETE this entire file.
 * Nothing outside auth.service.types.ts imports from here.
 */

import { AuthTokens } from '@/types/auth.types';


// ─── In-memory OTP store (lives in JS memory, resets on app reload) ───────────
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const otpStore = new Map<string, { code: string; expiresAt: number }>();

/** Stores a random OTP for the email and returns it (so we can log it). */
export function storeMockOtp(email: string): string {
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    otpStore.set(email.toLowerCase(), {
        code,
        expiresAt: Date.now() + OTP_TTL_MS,
    });
    return code;
}

/**
 * Verifies OTP.
 * '123456' always works — universal dev shortcut.
 * Deletes the code after first successful use (single-use).
 */
export function verifyMockOtp(email: string, code: string): boolean {
    if (code === '123456') return true;
    const entry = otpStore.get(email.toLowerCase());
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        otpStore.delete(email.toLowerCase());
        return false;
    }
    if (entry.code !== code) return false;
    otpStore.delete(email.toLowerCase());
    return true;
}

// ─── Mock token helpers ───────────────────────────────────────────────────────

/** Format: mock_access.{userId}.{timestamp} — userId is extractable */
export function generateMockTokens(userId: string): AuthTokens {
    return {
        accessToken:  `mock_access.${userId}.${Date.now()}`,
        refreshToken: `mock_refresh.${userId}.${Date.now()}`,
        expiresIn:    15 * 60, // 15 minutes
    };
}

/** Extract userId from a mock access or refresh token */
export function extractUserIdFromMockToken(token: string): string {
    return token.split('.')[1] ?? '';
}

/** Temp token carries the email through the profile-completion step */
export function generateMockTempToken(email: string): string {
    return `mock_temp::${email}::${Date.now()}`;
}

export function extractEmailFromMockTempToken(token: string): string {
    return token.split('::')[1] ?? '';
}

// ─── Mock social users ────────────────────────────────────────────────────────
// These simulate what you'd receive from Google / Apple OAuth on the server side.

export const MOCK_GOOGLE_USER = {
    id:        'social_google_1',
    email:     'mock.google@gmail.com',
    firstName: 'Арам',
    lastName:  'Саркисян',
    phone:     '',          // Google doesn't provide phone → needsProfile = true (new user)
    avatar:    null as null,
};

export const MOCK_APPLE_USER = {
    id:        'social_apple_1',
    email:     'hidden@privaterelay.appleid.com',
    firstName: 'Давит',
    lastName:  'Карапетян',
    phone:     '',
    avatar:    null as null,
};