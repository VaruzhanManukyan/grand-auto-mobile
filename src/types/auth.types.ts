// ─── Core user ────────────────────────────────────────────────────────────────
export type AuthUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string | null;
};

// ─── Token pair returned by the server ───────────────────────────────────────
export type AuthTokens = {
    accessToken: string;   // short-lived  (15 min in mock)
    refreshToken: string;  // long-lived   (30 days in mock)
    expiresIn: number;     // seconds until accessToken expires
};

// ─── OTP verification result (discriminated union) ────────────────────────────
export type OtpVerifyResult =
    | { isNewUser: false; tokens: AuthTokens; user: AuthUser }   // existing → log in
    | { isNewUser: true;  tempToken: string;  email: string };   // new → complete profile

// ─── Social login result ──────────────────────────────────────────────────────
export type SocialLoginResult = {
    needsProfile: boolean;  // true = new user, needs to add phone
    tokens: AuthTokens;
    user: AuthUser;
};

// ─── Profile completion payload ───────────────────────────────────────────────
export type ProfileData = {
    firstName: string;
    lastName: string;
    phone: string;
};

// ─── Steps in the auth flow (drives UI) ──────────────────────────────────────
export type AuthStep = 'idle' | 'otp' | 'profile' | 'social_profile';