import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface ScanLineProps {
    size: number;
    color: string;
}

export function ScanLine({ size, color }: ScanLineProps) {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(size - 3, {
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(0, {
                    duration: 1500,
                    easing: Easing.inOut(Easing.quad),
                }),
            ),
            -1,
            false,
        );
    }, [size]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[styles.wrapper, { width: size }, animatedStyle]}
            pointerEvents="none"
        >
            <LinearGradient
                colors={[`${color}00`, `${color}40`, `${color}00`]}
                style={styles.glow}
            />
            <LinearGradient
                colors={['transparent', color, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.line}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
    },
    line: {
        height: 2,
        borderRadius: 2,
    },
    glow: {
        position: 'absolute',
        top: -9,
        left: 0,
        right: 0,
        height: 20,
    },
});