import {dbGet, dbSet, KEYS} from '@/mocks/db';
import {
    storeMockOtp, verifyMockOtp,
    generateMockTokens, generateMockTempToken, extractEmailFromMockTempToken,
    extractUserIdFromMockToken,
    MOCK_GOOGLE_USER, MOCK_APPLE_USER,
} from '@/mocks/auth.mock';
import {
    AuthUser, AuthTokens, OtpVerifyResult,
    ProfileData, SocialLoginResult,
} from '@/types/auth.types';

const delay = (ms = 700) => new Promise(res => setTimeout(res, ms));

async function initLoyalty(userId: string) {
    const loyalty = (await dbGet<Record<string, any>>(KEYS.LOYALTY)) ?? {};
    if (!loyalty[userId]) {
        loyalty[userId] = {points: 0, totalSpent: 0, tier: 'bronze', history: []};
        await dbSet(KEYS.LOYALTY, loyalty);
    }
}

export const authService = {
    async sendOtp(email: string): Promise<void> {
        await delay(800);
        const code = storeMockOtp(email);
        console.log(`[DEV OTP] ${email} → ${code}   (or use 123456)`);
    },

    async verifyOtp(email: string, code: string): Promise<OtpVerifyResult> {
        await delay(700);

        if (!verifyMockOtp(email, code)) {
            throw new Error("auth.errors.code_min");
        }

        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (found) {
            const {password: _, ...user} = found;
            const tokens = generateMockTokens(user.id);
            return {isNewUser: false, tokens, user};
        }

        return {
            isNewUser: true,
            tempToken: generateMockTempToken(email),
            email,
        };
    },

    async completeProfile(
        tempToken: string,
        profile: ProfileData,
    ): Promise<{ tokens: AuthTokens; user: AuthUser }> {
        await delay(700);

        const email = extractEmailFromMockTempToken(tempToken);
        if (!email) throw new Error("auth.errors.incorrect_token");

        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error("auth.errors.email_already_registered");
        }

        const newUser: AuthUser = {
            id: `u_${Date.now()}`,
            email,
            avatar: null,
            ...profile,
        };

        await dbSet(KEYS.USERS, [...users, newUser]);
        await initLoyalty(newUser.id);

        return {tokens: generateMockTokens(newUser.id), user: newUser};
    },

    async loginWithGoogle(): Promise<SocialLoginResult> {
        await delay(900);

        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        const existing = users.find(u => u.id === MOCK_GOOGLE_USER.id);

        if (!existing) {
            await dbSet(KEYS.USERS, [...users, MOCK_GOOGLE_USER]);
            await initLoyalty(MOCK_GOOGLE_USER.id);
        }

        const user: AuthUser = existing
            ? (({password: _, ...u}) => u)(existing)
            : MOCK_GOOGLE_USER;

        return {
            needsProfile: !existing || !user.phone,
            tokens: generateMockTokens(MOCK_GOOGLE_USER.id),
            user,
        };
    },

    async loginWithApple(): Promise<SocialLoginResult> {
        await delay(900);

        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        const existing = users.find(u => u.id === MOCK_APPLE_USER.id);

        if (!existing) {
            await dbSet(KEYS.USERS, [...users, MOCK_APPLE_USER]);
            await initLoyalty(MOCK_APPLE_USER.id);
        }

        const user: AuthUser = existing
            ? (({password: _, ...u}) => u)(existing)
            : MOCK_APPLE_USER;

        return {
            needsProfile: !existing || !user.phone,
            tokens: generateMockTokens(MOCK_APPLE_USER.id),
            user,
        };
    },

    async completeSocialProfile(userId: string, profile: ProfileData): Promise<AuthUser> {
        await delay(500);

        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) throw new Error("auth.errors.user_not_found");

        users[idx] = {...users[idx], ...profile};
        await dbSet(KEYS.USERS, users);

        const {password: _, ...user} = users[idx];
        return user;
    },

    async getMe(accessToken: string): Promise<AuthUser | null> {
        await delay(200);

        const userId = extractUserIdFromMockToken(accessToken);
        const users = (await dbGet<any[]>(KEYS.USERS)) ?? [];
        const found = users.find(u => u.id === userId);
        if (!found) return null;

        const {password: _, ...user} = found;
        return user;
    },

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        await delay(300);
        const userId = refreshToken.split('.')[1] ?? 'unknown';
        return generateMockTokens(userId);
    },

    async logout(_refreshToken: string): Promise<void> {
        await delay(200);
    },
};