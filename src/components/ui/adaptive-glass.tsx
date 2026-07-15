/**
 * src/components/ui/adaptive-glass.tsx
 */
import React from 'react';
import { Platform, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

type Props = ViewProps & {
    colorScheme: 'light' | 'dark' | 'unspecified';
    solidColor: string; // opaque fallback for Android and pre-26 iOS
};

export function AdaptiveGlass({ style, colorScheme, solidColor, children, ...rest }: Props) {
    if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
        return (
            <GlassView style={style} glassEffectStyle="regular" colorScheme={colorScheme === "unspecified" ? "dark" : colorScheme} {...rest}>
                {children}
            </GlassView>
        );
    }

    if (Platform.OS === 'ios') {
        return (
            <BlurView
                intensity={40}
                tint={colorScheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                style={style}
                {...rest}
            >
                {children}
            </BlurView>
        );
    }

    return (
        <View style={[style, { backgroundColor: solidColor }]} {...rest}>
            {children}
        </View>
    );
}