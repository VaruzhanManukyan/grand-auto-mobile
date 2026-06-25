import { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Image, useColorScheme, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveLanguage } from '@/utils/i18n';
import { Colors } from '@/constants/theme';

const LANGUAGES = [
    { code: 'hy', label: 'Հայերեն', flag: require('@/assets/images/flags/am.png') },
    { code: 'en', label: 'English',  flag: require('@/assets/images/flags/en.png') },
    { code: 'ru', label: 'Русский',  flag: require('@/assets/images/flags/ru.png') },
];

export default function LanguagePicker({ onSelect }: { onSelect: () => void }) {
    const [selectedLanguage, setSelectedLanguage] = useState('hy');
    const [loadingCode, setLoadingCode] = useState<string | null>(null);

    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];

    const pick = async (code: string) => {
        if (loadingCode) return;
        setSelectedLanguage(code);
        setLoadingCode(code);
        await saveLanguage(code);
        onSelect();
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.logo, { color: colors.text }]}>GRAND AUTO</Text>
                    <View style={styles.accent} />
                </View>
                <View style={styles.list}>
                    {LANGUAGES.map((l) => {
                        const isLoading = loadingCode === l.code;
                        const isActive  = l.code === selectedLanguage;
                        return (
                            <TouchableOpacity
                                key={l.code}
                                style={[
                                    styles.btn,
                                    { backgroundColor: colors.backgroundElement },
                                    isActive && styles.btnActive,
                                ]}
                                onPress={() => pick(l.code)}
                                activeOpacity={0.70}
                                disabled={!!loadingCode}
                            >
                                <Image
                                    source={l.flag}
                                    style={styles.flagImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.btnText}>
                                    <Text style={[styles.label, { color: colors.text }]}>
                                        {l.label}
                                    </Text>
                                </View>
                                {isLoading && (
                                    <ActivityIndicator
                                        size="small"
                                        color="red"
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 24,
    },
    header: {
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 6,
    },
    accent: {
        width: 40,
        height: 3,
        backgroundColor: '#C8102E',
        borderRadius: 2,
    },
    list: {
        gap: 12,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#646363',
        gap: 16,
    },
    btnActive: {
        borderColor: '#C8102E',
        backgroundColor: 'rgb(178 0 45 / 0.35)',
    },
    flagImage: {
        width: 36,
        height: 36,
        borderRadius: 4,
    },
    btnText: {
        flex: 1,
        gap: 2,
    },
    label: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});