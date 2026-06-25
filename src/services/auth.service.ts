import {dbGet, dbSet, KEYS} from '@/mock/db';

export type AuthUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string | null;
};

const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));

export const authService = {
    async login(email: string, password: string): Promise<AuthUser> {
        await delay();
        const users = await dbGet<any[]>(KEYS.USERS) ?? [];
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Неверный email или пароль');

        const {password: _, ...safeUser} = user;
        await dbSet(KEYS.SESSION, safeUser);
        return safeUser;
    },

    async loginWithGoogle(): Promise<AuthUser> {
        await delay(800);
        const users = await dbGet<any[]>(KEYS.USERS) ?? [];
        const {password: _, ...safeUser} = users[0];
        await dbSet(KEYS.SESSION, safeUser);
        return safeUser;
    },

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }): Promise<AuthUser> {
        await delay();
        const users = await dbGet<any[]>(KEYS.USERS) ?? [];
        if (users.find(u => u.email === data.email)) {
            throw new Error('Email уже используется');
        }

        const newUser = {
            id: `u${Date.now()}`,
            ...data,
            avatar: null,
            createdAt: new Date().toISOString(),
        };
        await dbSet(KEYS.USERS, [...users, newUser]);

        const loyalty = await dbGet<any>(KEYS.LOYALTY) ?? {};
        loyalty[newUser.id] = {points: 0, totalSpent: 0, tier: 'bronze', history: []};
        await dbSet(KEYS.LOYALTY, loyalty);

        const {password: _, ...safeUser} = newUser;
        await dbSet(KEYS.SESSION, safeUser);
        return safeUser;
    },

    async logout(): Promise<void> {
        await delay(300);
        await dbSet(KEYS.SESSION, null);
    },

    async getSession(): Promise<AuthUser | null> {
        return dbGet<AuthUser>(KEYS.SESSION);
    },
};