import React from 'react';
import { View, Text, StyleSheet, Modal, useColorScheme } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors } from "@/constants/theme";

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
    mode?: 'overlay' | 'full';
}

export function LoadingOverlay({
                                   visible,
                                   message = '',
                                   mode = 'overlay',
                               }: LoadingOverlayProps) {
    const scheme = useColorScheme();
    const currentTheme = scheme === 'unspecified' || !scheme ? 'dark' : scheme;
    const colors = Colors[currentTheme];

    if (!visible) return null;

    const overlayBg = currentTheme === 'dark' ? 'rgba(10,10,10,0.85)' : 'rgba(245,245,245,0.85)';
    const bgColor = mode === 'full' ? colors.background : overlayBg;

    return (
        <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
            <View style={[styles.root, { backgroundColor: bgColor }]}>

                <View style={styles.animationContainer}>
                    <LottieView
                        source={require('@/assets/loading.json')}
                        autoPlay
                        loop
                        style={styles.lottie}
                    />
                </View>

                {!!message && (
                    <Text style={[styles.message, { color: colors.text }]}>
                        {message}
                    </Text>
                )}

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animationContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.4,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});