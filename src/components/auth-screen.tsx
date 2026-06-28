import {useEffect, useMemo, useState} from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useAuthStore} from '@/store/auth.store';
import {useTheme} from '@/hooks/use-theme';
import {useTranslation} from 'react-i18next';
import {FontAwesome, AntDesign} from '@expo/vector-icons';
import {LoadingOverlay} from '@/components/loading';

// ---------- validation helpers ----------
const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'auth.errors.email_required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'auth.errors.email_invalid';
    return null;
};

const validateCode = (code: string): string | null => {
    if (!code.trim()) return 'auth.errors.code_required';
    if (code.trim().length < 6) return 'auth.errors.code_min';
    return null;
};

const validateName = (name: string, field: 'first' | 'last'): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return field === 'first' ? 'auth.errors.first_name_required' : 'auth.errors.last_name_required';
    if (trimmed.length < 2) return field === 'first' ? 'auth.errors.first_name_min' : 'auth.errors.last_name_min';
    return null;
};

const validatePhone = (phone: string): string | null => {
    const localDigits = phone.replace('+374', '').replace(/\D/g, '');
    if (!localDigits) return 'auth.errors.phone_required';
    if (localDigits.length < 8) return 'auth.errors.phone_min';
    return null;
};

// ---------- Field Component ----------
function Field({
                   label,
                   value,
                   onChangeText,
                   onBlur,
                   placeholder,
                   keyboardType = 'default',
                   secureTextEntry = false,
                   maxLength,
                   error,
               }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
    secureTextEntry?: boolean;
    maxLength?: number;
    error?: string | null;
}) {
    const theme = useTheme();

    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, {color: theme.textSecondary}]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                maxLength={maxLength}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                    styles.input,
                    {
                        borderColor: error ? '#c62828' : theme.backgroundSelected,
                        color: theme.text,
                        backgroundColor: theme.backgroundElement,
                    },
                ]}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

// ---------- PhoneInputField ----------
function PhoneInputField({
                             value,
                             onChangeText,
                             onBlur,
                             error,
                         }: {
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    error?: string | null;
}) {
    const theme = useTheme();
    const {t} = useTranslation();

    const rawDigits = value.startsWith('+374')
        ? value.slice(4).replace(/\D/g, '')
        : value.replace(/\D/g, '');

    const displayValue = (() => {
        if (rawDigits.length <= 2) return rawDigits;
        if (rawDigits.length <= 5) return `${rawDigits.slice(0, 2)} ${rawDigits.slice(2)}`;
        return `${rawDigits.slice(0, 2)} ${rawDigits.slice(2, 5)} ${rawDigits.slice(5)}`;
    })();

    const handleChange = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, 8);
        onChangeText('+374' + digits);
    };

    return (
        <View style={styles.fieldWrap}>
            <Text style={[styles.label, {color: theme.textSecondary}]}>
                {t('auth.phone_label')}
            </Text>
            <View
                style={[
                    styles.phoneWrapper,
                    {borderColor: error ? '#c62828' : theme.backgroundSelected},
                ]}
            >
                <View
                    style={[
                        styles.countryBox,
                        {
                            backgroundColor: theme.iconSelected,
                            borderRightColor: 'rgba(255,255,255,0.25)',
                        },
                    ]}
                >
                    <Text style={styles.countryCodeText}>+374</Text>
                </View>

                <TextInput
                    value={displayValue}
                    onChangeText={handleChange}
                    onBlur={onBlur}
                    placeholder="XX XXX XXX"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                    style={[
                        styles.phoneInput,
                        {
                            color: theme.text,
                            backgroundColor: theme.backgroundElement,
                        },
                    ]}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

// ---------- Button Component ----------
function Button({
                    title,
                    onPress,
                    variant = 'primary',
                    disabled,
                    icon,
                    color
                }: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'social';
    disabled?: boolean;
    icon?: React.ReactNode;
    color: string
}) {
    const theme = useTheme();

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return {backgroundColor: theme.iconSelected};
            case 'secondary':
                return {backgroundColor: theme.backgroundElement};
            case 'social':
                return {backgroundColor: theme.backgroundElement};
            case 'ghost':
                return {backgroundColor: 'transparent'};
            default:
                return {};
        }
    };

    const getButtonTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return {color: theme.text};
            case 'ghost':
                return {color: theme.textSecondary};
            default:
                return {color: '#ffffff'};
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({pressed}) => [
                styles.button,
                getButtonStyle(),
                variant === 'social' && styles.socialButton,
                disabled && styles.buttonDisabled,
                pressed && !disabled && {opacity: 0.85},
            ]}
        >
            <View style={styles.buttonContent}>
                {icon && <View style={styles.buttonIcon}>{icon}</View>}
                <Text style={[styles.buttonText, getButtonTextStyle(), {color: color}]}>{title}</Text>
            </View>
        </Pressable>
    );
}

// ---------- Main AuthScreen ----------
export default function AuthScreen() {
    const {t} = useTranslation();
    const theme = useTheme();

    const step = useAuthStore((s) => s.step);
    const isLoading = useAuthStore((s) => s.isLoading);
    const error = useAuthStore((s) => s.error);

    const sendOtp = useAuthStore((s) => s.sendOtp);
    const verifyOtp = useAuthStore((s) => s.verifyOtp);
    const completeProfile = useAuthStore((s) => s.completeProfile);
    const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
    const loginWithApple = useAuthStore((s) => s.loginWithApple);
    const completeSocialProfile = useAuthStore((s) => s.completeSocialProfile);
    const goToStep = useAuthStore((s) => s.goToStep);
    const resetFlow = useAuthStore((s) => s.resetFlow);
    const clearError = useAuthStore((s) => s.clearError);

    // -------- field states --------
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // -------- profile phase: 'phone' → 'details' --------
    const [profilePhase, setProfilePhase] = useState<'phone' | 'details'>('phone');

    // -------- validation errors --------
    const [emailError, setEmailError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    useEffect(() => {
        clearError();
        setProfilePhase('phone');
    }, [step, clearError]);

    // -------- validation functions --------
    const validateEmailField = (value: string) => {
        const err = validateEmail(value);
        setEmailError(err ? t(err) : null);
        return !err;
    };

    const validateCodeField = (value: string) => {
        const err = validateCode(value);
        setCodeError(err ? t(err) : null);
        return !err;
    };

    const validateFirstNameField = (value: string) => {
        const err = validateName(value, 'first');
        setFirstNameError(err ? t(err) : null);
        return !err;
    };

    const validateLastNameField = (value: string) => {
        const err = validateName(value, 'last');
        setLastNameError(err ? t(err) : null);
        return !err;
    };

    const validatePhoneField = (value: string) => {
        const err = validatePhone(value);
        setPhoneError(err ? t(err) : null);
        return !err;
    };

    const isFormValid = useMemo(() => {
        if (step === 'idle') return validateEmail(email) === null;
        if (step === 'otp') return validateCode(code) === null;
        if (step === 'profile' || step === 'social_profile') {
            if (profilePhase === 'phone') return validatePhone(phone) === null;
            return (
                validateName(firstName, 'first') === null &&
                validateName(lastName, 'last') === null &&
                validatePhone(phone) === null
            );
        }
        return false;
    }, [step, email, code, firstName, lastName, phone, profilePhase]);

    const canSubmit = useMemo(() => isFormValid && !isLoading, [isFormValid, isLoading]);

    const title = useMemo(() => {
        switch (step) {
            case 'otp':
                return t('auth.title.otp');
            case 'profile':
                return t('auth.title.profile');
            case 'social_profile':
                return t('auth.title.social_profile');
            default:
                return t('auth.title.idle');
        }
    }, [step, t]);

    const handlePhoneContinue = () => {
        if (!validatePhoneField(phone)) return;
        Keyboard.dismiss();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setProfilePhase('details');
    };

    const handlePrimary = async () => {
        let valid = true;
        if (step === 'idle') {
            valid = validateEmailField(email);
        } else if (step === 'otp') {
            valid = validateCodeField(code);
        } else if (step === 'profile' || step === 'social_profile') {
            const v1 = validateFirstNameField(firstName);
            const v2 = validateLastNameField(lastName);
            const v3 = validatePhoneField(phone);
            valid = v1 && v2 && v3;
        }
        if (!valid) return;

        Keyboard.dismiss();
        clearError();
        try {
            if (step === 'idle') {
                const cleanEmail = email.trim().toLowerCase();
                if (!cleanEmail) return;
                await sendOtp(cleanEmail);
                return;
            }
            if (step === 'otp') {
                const cleanCode = code.trim();
                if (!cleanCode) return;
                await verifyOtp(cleanCode);
                return;
            }
            if (step === 'profile') {
                await completeProfile({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                });
                return;
            }
            if (step === 'social_profile') {
                await completeSocialProfile({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                });
            }
        } catch {
        }
    };

    const handleGoogle = async () => {
        clearError();
        await loginWithGoogle();
    };
    const handleApple = async () => {
        clearError();
        await loginWithApple();
    };

    if (isLoading) {
        return (
            <View style={{flex: 1}}>
                <LoadingOverlay visible />
            </View>
        );
    }

    const GoogleIcon = () => <AntDesign name="google" size={20} color={theme.text}/>;
    const AppleIcon = () => <FontAwesome name="apple" size={22} color={theme.text}/>;

    return (
        <KeyboardAvoidingView
            style={[styles.root, {backgroundColor: theme.background}]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.cardBorder,
                        },
                    ]}
                >
                    <Text style={[styles.brand, {color: theme.textSelected}]}>
                        {t('auth.brand')}
                    </Text>
                    <Text style={[styles.title, {color: theme.text}]}>{title}</Text>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    {step === 'idle' && (
                        <>
                            <Field
                                label={t('auth.email_label')}
                                value={email}
                                onChangeText={setEmail}
                                onBlur={() => validateEmailField(email)}
                                placeholder={t('auth.email_placeholder')}
                                keyboardType="email-address"
                                error={emailError}
                            />
                            <Button
                                title={t('auth.continue_email')}
                                onPress={handlePrimary}
                                disabled={!canSubmit}
                                color={"white"}
                            />
                            <View style={styles.dividerRow}>
                                <View style={[styles.divider, {backgroundColor: theme.backgroundSelected}]}/>
                                <Text style={[styles.dividerText, {color: theme.textSecondary}]}>
                                    {t('auth.or')}
                                </Text>
                                <View style={[styles.divider, {backgroundColor: theme.backgroundSelected}]}/>
                            </View>
                            <Button title={t('auth.google_login')} variant="social" onPress={handleGoogle}
                                    disabled={isLoading} icon={<GoogleIcon/>} color={theme.text}/>

                            {Platform.OS === 'ios' && (
                                <Button title={t('auth.apple_login')} variant="social" onPress={handleApple}
                                        disabled={isLoading} icon={<AppleIcon/>} color={theme.text}/>
                            )}
                        </>
                    )}

                    {/* ── OTP ── */}
                    {step === 'otp' && (
                        <>
                            <Field
                                label={t('auth.code_label')}
                                value={code}
                                onChangeText={setCode}
                                onBlur={() => validateCodeField(code)}
                                placeholder={t('auth.code_placeholder')}
                                keyboardType="number-pad"
                                maxLength={6}
                                error={codeError}
                            />
                            <Button title={t('auth.verify_code')} onPress={handlePrimary} disabled={!canSubmit} color={"white"}/>
                            <Button title={t('auth.back')} variant="ghost" onPress={() => goToStep('idle')}
                                    disabled={isLoading} color={theme.text}/>
                        </>
                    )}

                    {/* ── PROFILE / SOCIAL_PROFILE ── */}
                    {(step === 'profile' || step === 'social_profile') && (
                        <>
                            <PhoneInputField
                                value={phone}
                                onChangeText={setPhone}
                                onBlur={() => validatePhoneField(phone)}
                                error={phoneError}
                            />

                            {profilePhase === 'phone' && (
                                <Button
                                    title={t('auth.phone_continue')}
                                    onPress={handlePhoneContinue}
                                    disabled={!canSubmit}
                                    color={"white"}
                                />
                            )}

                            {profilePhase === 'details' && (
                                <>
                                    <Field
                                        label={t('auth.first_name_label')}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        onBlur={() => validateFirstNameField(firstName)}
                                        placeholder={t('auth.first_name_placeholder')}
                                        error={firstNameError}
                                    />
                                    <Field
                                        label={t('auth.last_name_label')}
                                        value={lastName}
                                        onChangeText={setLastName}
                                        onBlur={() => validateLastNameField(lastName)}
                                        placeholder={t('auth.last_name_placeholder')}
                                        error={lastNameError}
                                    />
                                    <Button
                                        title={t('auth.complete_registration')}
                                        onPress={handlePrimary}
                                        disabled={!canSubmit}
                                        color={"white"}
                                    />
                                </>
                            )}

                            <Button
                                title={t('auth.cancel')}
                                variant="ghost"
                                onPress={() => resetFlow()}
                                disabled={isLoading}
                                color={theme.text}
                            />
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
    root: {flex: 1},
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        gap: 12,
    },
    brand: {
        fontSize: 14,
        alignSelf: 'center',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        alignSelf: 'center',
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    error: {
        color: '#c62828',
        fontSize: 14,
        marginTop: 4,
    },
    fieldWrap: {
        gap: 4,
        marginTop: 4,
    },
    label: {
        fontSize: 12,
        paddingVertical: 6,
        paddingHorizontal: 2,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    errorText: {
        color: '#c62828',
        fontSize: 12,
        marginTop: 2,
        marginLeft: 4,
    },
    phoneWrapper: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 48,
    },
    countryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        gap: 8,
        borderRightWidth: 1.5,
    },
    countryCodeText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
    },
    phoneInput: {
        flex: 1,
        fontSize: 20,
        fontWeight: '800',
        paddingHorizontal: 26,
        paddingVertical: 6,
        letterSpacing: 2,
        textAlignVertical: 'center',
    },
    button: {
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    socialButton: {
        flexDirection: 'row',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 10,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 8,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
    },
});

