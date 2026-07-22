import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/use-theme';

interface ServiceRatingInputProps {
    value: number | null;
    onRate: (rating: number) => void;
}

export function ServiceRatingInput({ value, onRate }: ServiceRatingInputProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const thankYouOpacity = useRef(new Animated.Value(0)).current;

    const handlePress = (star: number) => {
        onRate(star);
        thankYouOpacity.stopAnimation();
        thankYouOpacity.setValue(1);
        Animated.timing(thankYouOpacity, {
            toValue: 0,
            duration: 700,
            delay: 1200,
            useNativeDriver: true,
        }).start();
    };

    // Smoothly fade helper text out to 0 when thankYouOpacity is 1, and back to 0.6 when 0
    const helperOpacity = thankYouOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
    });

    return (
        <View style={styles.wrap}>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = value != null && star <= value;
                    return (
                        <Pressable key={star} onPress={() => handlePress(star)} hitSlop={6}>
                            <Ionicons
                                name={filled ? 'star' : 'star-outline'}
                                size={30}
                                color={filled ? '#FFD60A' : theme.text}
                                style={{ opacity: filled ? 1 : 0.3 }}
                            />
                        </Pressable>
                    );
                })}
            </View>
            <View style={styles.feedbackWrap}>
                <Animated.Text style={[styles.helperText, { color: theme.text, opacity: helperOpacity }]}>
                    {value != null ? t('services.rating.yourRating', { rating: value }) : t('services.rating.prompt')}
                </Animated.Text>
                <Animated.Text
                    style={[styles.thankYou, { color: theme.accent, opacity: thankYouOpacity }]}
                    pointerEvents="none"
                >
                    {t('services.rating.thankYou')}
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 10 },
    starsRow: { flexDirection: 'row', gap: 6 },
    feedbackWrap: { minHeight: 18, justifyContent: 'center' },
    helperText: { fontSize: 13 },
    thankYou: {
        position: 'absolute',
        left: 0,
        fontSize: 13,
        fontWeight: '700',
    },
});