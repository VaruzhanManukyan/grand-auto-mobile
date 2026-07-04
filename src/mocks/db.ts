import AsyncStorage from '@react-native-async-storage/async-storage';
import {MOCK_USERS, MOCK_LOYALTY} from './data';

export const KEYS = {
    USERS: 'mock:users',
    LOYALTY: 'mock:loyalty',
    SESSION: 'mock:session',
} as const;

export async function initMockDB() {
    const existing = await AsyncStorage.getItem(KEYS.USERS);
    if (existing) return;

    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
    await AsyncStorage.setItem(KEYS.LOYALTY, JSON.stringify(MOCK_LOYALTY));
}

export async function dbGet<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export async function dbSet(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}