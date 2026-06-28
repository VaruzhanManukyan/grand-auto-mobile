/**
 * services/token.service.ts
 *
 * Stores access + refresh tokens in the device's secure keychain.
 * Handles automatic refresh when the access token is close to expiry.
 *
 * This file does NOT change when you switch to a real backend.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthTokens } from '@/types/auth.types';

const KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    EXPIRES_AT: 'auth_expires_at',
} as const;

// SecureStore is native-only; fall back to AsyncStorage on web
const store = {
    async get(key: string): Promise<string | null> {
        if (Platform.OS === 'web') return AsyncStorage.getItem(key);
        return SecureStore.getItemAsync(key);
    },
    async set(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') { await AsyncStorage.setItem(key, value); return; }
        await SecureStore.setItemAsync(key, value);
    },
    async del(key: string): Promise<void> {
        if (Platform.OS === 'web') { await AsyncStorage.removeItem(key); return; }
        await SecureStore.deleteItemAsync(key);
    },
};

export const tokenService = {
    /** Save both tokens after successful login */
    async save(tokens: AuthTokens): Promise<void> {
        const expiresAt = Date.now() + tokens.expiresIn * 1000;
        await Promise.all([
            store.set(KEYS.ACCESS_TOKEN,  tokens.accessToken),
            store.set(KEYS.REFRESH_TOKEN, tokens.refreshToken),
            store.set(KEYS.EXPIRES_AT,    String(expiresAt)),
        ]);
    },

    async getAccessToken():  Promise<string | null> { return store.get(KEYS.ACCESS_TOKEN); },
    async getRefreshToken(): Promise<string | null> { return store.get(KEYS.REFRESH_TOKEN); },

    /** True if the access token has expired (or expires in the next 30 seconds) */
    async isExpired(): Promise<boolean> {
        const raw = await store.get(KEYS.EXPIRES_AT);
        if (!raw) return true;
        return Date.now() > parseInt(raw, 10) - 30_000;
    },

    async clear(): Promise<void> {
        await Promise.all([
            store.del(KEYS.ACCESS_TOKEN),
            store.del(KEYS.REFRESH_TOKEN),
            store.del(KEYS.EXPIRES_AT),
        ]);
    },

    /**
     * Returns a guaranteed-valid access token.
     * If the current one is expired, uses `refreshFn` to get a new pair.
     * Returns null when no session exists at all (user must log in).
     *
     * Usage: tokenService.getValid(authService.refreshToken)
     */
    async getValid(
        refreshFn: (refreshToken: string) => Promise<AuthTokens>,
    ): Promise<string | null> {
        const expired = await this.isExpired();
        if (!expired) return this.getAccessToken();

        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) return null;

        try {
            const newTokens = await refreshFn(refreshToken);
            await this.save(newTokens);
            return newTokens.accessToken;
        } catch {
            // Refresh token itself is expired / invalid → force re-login
            await this.clear();
            return null;
        }
    },
};