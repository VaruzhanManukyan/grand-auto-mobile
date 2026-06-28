/**
 * store/auth.store.ts
 *
 * All auth state + actions.
 * Talks only to authService and tokenService — never to mocks directly.
 * This file does NOT change when you switch to a real backend.
 */

import {create} from 'zustand';
import {authService} from '@/services/auth.service';
import {tokenService} from '@/services/token.service';
import {AuthUser, AuthStep, ProfileData} from '@/types/auth.types';

type State = {
    user: AuthUser | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    step: AuthStep;
    _pendingEmail: string;
    _pendingTempToken: string;
    _pendingSocialUser: AuthUser | null;
};

type Actions = {
    init(): Promise<void>;

    sendOtp(email: string): Promise<void>;
    verifyOtp(code: string): Promise<void>;
    completeProfile(profile: ProfileData): Promise<void>;

    loginWithGoogle(): Promise<void>;
    loginWithApple(): Promise<void>;
    completeSocialProfile(profile: ProfileData): Promise<void>;

    logout(): Promise<void>;
    clearError(): void;
    goToStep(step: AuthStep): void;
    resetFlow(): void;
};

export const useAuthStore = create<State & Actions>((set, get) => ({
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    step: 'idle',
    _pendingEmail: '',
    _pendingTempToken: '',
    _pendingSocialUser: null,

    init: async () => {
        try {
            const token = await tokenService.getValid(authService.refreshToken);
            if (!token) return set({ user: null, isInitialized: true });
            const user = await authService.getMe(token); // ← pass token, not null
            if (!user) return set({ user: null, isInitialized: true });
            set({ user, isInitialized: true });
        } catch {
            await tokenService.clear();
            set({ user: null, isInitialized: true });
        }
    },

    sendOtp: async (email) => {
        set({isLoading: true, error: null});
        try {
            await authService.sendOtp(email);
            set({step: 'otp', _pendingEmail: email, isLoading: false});
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    verifyOtp: async (code) => {
        set({isLoading: true, error: null});
        try {
            const result = await authService.verifyOtp(get()._pendingEmail, code);

            if (result.isNewUser) {
                set({step: 'profile', _pendingTempToken: result.tempToken, isLoading: false});
            } else {
                await tokenService.save(result.tokens);
                set({user: result.user, step: 'idle', isLoading: false});
            }
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    completeProfile: async (profile) => {
        set({isLoading: true, error: null});
        try {
            const {tokens, user} = await authService.completeProfile(
                get()._pendingTempToken,
                profile,
            );
            await tokenService.save(tokens);
            set({
                user,
                step: 'idle',
                _pendingEmail: '',
                _pendingTempToken: '',
                isLoading: false,
            });
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    // ─── Social ─────────────────────────────────────────────────────────────────
    loginWithGoogle: async () => {
        set({isLoading: true, error: null});
        try {
            const result = await authService.loginWithGoogle();
            await tokenService.save(result.tokens);

            if (result.needsProfile) {
                set({step: 'social_profile', _pendingSocialUser: result.user, isLoading: false});
            } else {
                set({user: result.user, step: 'idle', isLoading: false});
            }
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    loginWithApple: async () => {
        set({isLoading: true, error: null});
        try {
            const result = await authService.loginWithApple();
            await tokenService.save(result.tokens);

            if (result.needsProfile) {
                set({step: 'social_profile', _pendingSocialUser: result.user, isLoading: false});
            } else {
                set({user: result.user, step: 'idle', isLoading: false});
            }
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    completeSocialProfile: async (profile) => {
        const socialUser = get()._pendingSocialUser;
        if (!socialUser) return;
        set({isLoading: true, error: null});
        try {
            const user = await authService.completeSocialProfile(socialUser.id, profile);
            set({user, step: 'idle', _pendingSocialUser: null, isLoading: false});
        } catch (e: any) {
            set({error: e.message, isLoading: false});
        }
    },

    // ─── Utils ──────────────────────────────────────────────────────────────────
    logout: async () => {
        const refreshToken = await tokenService.getRefreshToken();
        if (refreshToken) {
            try {
                await authService.logout(refreshToken);
            } catch { /* ignore */
            }
        }
        await tokenService.clear();
        set({user: null, step: 'idle'});
    },

    clearError: () => set({error: null}),

    goToStep: (step) => set({step, error: null}),

    resetFlow: () => set({
        step: 'idle',
        error: null,
        _pendingEmail: '',
        _pendingTempToken: '',
        _pendingSocialUser: null,
    }),
}));