import {create} from 'zustand';
import {authService, AuthUser} from '@/services/auth.service';

type RegisterData = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
};

type AuthState = {
    user: AuthUser | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    init: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    init: async () => {
        const user = await authService.getSession();
        set({user, isInitialized: true});
    },

    login: async (email, password) => {
        set({isLoading: true, error: null});
        try {
            const user = await authService.login(email, password);
            set({user, isLoading: false});
        } catch (e: any) {
            set({error: e.message, isLoading: false});
            throw e;
        }
    },

    loginWithGoogle: async () => {
        set({isLoading: true, error: null});
        try {
            const user = await authService.loginWithGoogle();
            set({user, isLoading: false});
        } catch (e: any) {
            set({error: e.message, isLoading: false});
            throw e;
        }
    },

    register: async (data) => {
        set({isLoading: true, error: null});
        try {
            const user = await authService.register(data);
            set({user, isLoading: false});
        } catch (e: any) {
            set({error: e.message, isLoading: false});
            throw e;
        }
    },

    logout: async () => {
        await authService.logout();
        set({user: null});
    },

    clearError: () => set({error: null}),
}));