import React, { forwardRef, useEffect } from 'react';
import { Pressable, PressableProps, StyleSheet, View, Image, useColorScheme } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Colors } from "@/constants/theme";

type Props = PressableProps & {
    label: string;
    name: string;
    focused: boolean;
    isFloating?: boolean;
    isDark?: boolean;
};

const iconMap: Record<string, any> = {
    home: require('@/assets/images/tabIcons/home.png'),
    services: require('@/assets/images/tabIcons/service.png'),
    qr: require('@/assets/images/tabIcons/qr.png'),
    cars: require('@/assets/images/tabIcons/car.png'),
    more: require('@/assets/images/tabIcons/more.png'),
};

export const TabButton = forwardRef<View, Props>(({
                                                      label,
                                                      name,
                                                      focused,
                                                      isFloating = false,
                                                      ...props
                                                  }, ref) => {
    const scale = useSharedValue(0);
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];

    useEffect(() => {
        scale.value = withSpring(focused ? 1 : 0, { duration: 300 });
    }, [focused]);

    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = isFloating ? 0 : interpolate(scale.value, [0, 1], [1, 0]);
        return { opacity };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        if (isFloating) {
            const scaleValue = withSpring(focused ? 1.3 : 1);
            return { transform: [{ scale: scaleValue }] };
        }

        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
        const top = interpolate(scale.value, [0, 1], [0, 8]);
        return {
            transform: [{ scale: scaleValue }],
            top,
        };
    });

    const iconSource = iconMap[name];
    const iconSize = isFloating ? 28 : 24;

    const buttonStyle = isFloating
        ? [styles.floatingButton, {
            backgroundColor: focused ? '#e50000' : '#ff0000',
            shadowColor: '#000000'
        }]
        : styles.standardButton;

    const activeColor = '#ff0000';

    const iconColor = isFloating
        ? '#FFFFFF'
        : (focused ? activeColor : colors.text);

    return (
        <Pressable ref={ref} {...props} style={buttonStyle}>
            <Animated.View style={animatedIconStyle}>
                {iconSource ? (
                    <Image
                        source={iconSource}
                        style={{
                            width: iconSize,
                            height: iconSize,
                            tintColor: iconColor,
                            resizeMode: 'contain'
                        }}
                    />
                ) : (
                    <View style={{ width: iconSize, height: iconSize, backgroundColor: '#e74c3c', borderRadius: 6 }} />
                )}
            </Animated.View>

            {!isFloating && (
                <View style={styles.labelWrapper}>
                    <Animated.Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        style={[
                            styles.labelText,
                            { color: colors.text },
                            animatedTextStyle
                        ]}
                    >
                        {label}
                    </Animated.Text>
                </View>
            )}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    standardButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: 2, // Replaced fixed width: 70 to give flex growth room
    },
    floatingButton: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 35,
        shadowOpacity: 0.35,
        elevation: 5,
    },
    labelWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        paddingHorizontal: 1,
    },
    labelText: {
        fontSize: 10,
        lineHeight: 13,
        textAlign: 'center',
        includeFontPadding: false,
        width: '100%',
    }
});