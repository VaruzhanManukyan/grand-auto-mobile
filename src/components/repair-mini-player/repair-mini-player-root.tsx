import React, { useEffect } from 'react';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSegments } from 'expo-router';
import { useRepairsStore } from '@/store/repairs.store';
import { RepairMiniPlayer } from './repair-mini-player';

const SCREEN_WIDTH = Dimensions.get('window').width;
const OFFSCREEN_X = -(SCREEN_WIDTH + 50);

export function RepairMiniPlayerRoot() {
    const segments = useSegments();
    const isMoreTab = segments.includes('more');
    const fetch = useRepairsStore((s) => s.fetch);
    const sessions = useRepairsStore((s) => s.sessions);
    const hasSessions = sessions.length > 0;

    const translateX = useSharedValue(OFFSCREEN_X);

    useEffect(() => {
        fetch();
    }, []);

    useEffect(() => {
        if (!hasSessions) return;
        translateX.value = withTiming(isMoreTab ? OFFSCREEN_X : 0, { duration: 250 });
    }, [isMoreTab, hasSessions]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    if (!sessions.length) return null;

    return (
        <Animated.View
            pointerEvents={isMoreTab ? 'none' : 'auto'}
            style={[
                styles.wrapper,
                { bottom: Platform.OS === 'ios' ? 90 : 110 },
                containerStyle,
            ]}
        >
            <RepairMiniPlayer isMoreTab={isMoreTab} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 8,
        right: 8,
        zIndex: 0,
        elevation: 99,
    },
});