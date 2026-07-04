/**
 * components/LoyaltySpeedometer.tsx
 *
 * Minimal semicircle gauge. Pure presentation — it knows nothing about
 * levels or AMD, it just animates a ratio. Swap the arc math for a
 * needle if you'd rather have a literal speedometer look.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 260;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;

function polarToCartesian(angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: CENTER + RADIUS * Math.cos(angleRad),
        y: CENTER + RADIUS * Math.sin(angleRad),
    };
}

// Semicircle: sweeps 180° (9 o'clock) → 360°/0° (3 o'clock), bottom half unused.
function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

const TRACK_PATH = describeArc(180, 360);
const ARC_LENGTH = Math.PI * RADIUS;

interface Props {
    value: number; // currentValueInLevel
    maxValue: number; // maxValueInLevel
    color: string;
    unitLabel?: string;
}

export function LoyaltySpeedometer({ value, maxValue, color, unitLabel }: Props) {
    const { t } = useTranslation();
    const progress = useSharedValue(0);

    useEffect(() => {
        const ratio = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
        progress.value = withTiming(ratio, { duration: 700, easing: Easing.out(Easing.cubic) });
    }, [value, maxValue]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: ARC_LENGTH * (1 - progress.value),
    }));

    return (
        <View style={styles.wrap}>
            <Svg width={SIZE} height={CENTER + STROKE_WIDTH} viewBox={`0 0 ${SIZE} ${CENTER + STROKE_WIDTH}`}>
                <Path d={TRACK_PATH} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE_WIDTH} strokeLinecap="round" fill="none" />
                <AnimatedPath
                    d={TRACK_PATH}
                    stroke={color}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={ARC_LENGTH}
                    animatedProps={animatedProps}
                />
            </Svg>
            <View style={styles.readout} pointerEvents="none">
                <Text style={[styles.value, { color }]}>{Math.round(value).toLocaleString()}</Text>
                <Text style={styles.unit}>{unitLabel ?? t('loyalty.speedometer.unit')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'flex-end' },
    readout: { position: 'absolute', bottom: 8, alignItems: 'center' },
    value: { fontSize: 40, fontWeight: '800', letterSpacing: 0.5 },
    unit: { fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginTop: 2 },
});