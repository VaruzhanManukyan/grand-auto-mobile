import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const CRIMSON = '#C8102E';
const WHITE = '#FFFFFF';

interface ButtonSpinnerProps {
    /** 'white' for dark buttons, 'crimson' for light buttons */
    color?: 'white' | 'crimson';
    size?: number;
}

/**
 * Tiny spinner to place inside a <TouchableOpacity> when a form is submitting.
 * Replace the button label with this — it takes exactly the same visual space.
 *
 * @example
 * <TouchableOpacity style={styles.btn} disabled={loading}>
 *   {loading ? <ButtonSpinner /> : <Text>Сохранить</Text>}
 * </TouchableOpacity>
 */
export function ButtonSpinner({color = 'white', size = 20}: ButtonSpinnerProps) {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {duration: 750, easing: Easing.linear}),
            -1,
            false
        );
    }, []);

    const spinStyle = useAnimatedStyle(() => ({
        transform: [{rotate: `${rotation.value}deg`}],
    }));

    const borderColor = color === 'white' ? WHITE : CRIMSON;

    return (
        <View style={{width: size, height: size}}>
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor,
                        borderTopColor: 'transparent',
                    },
                    spinStyle,
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    ring: {
        borderWidth: 2.5,
    },
});