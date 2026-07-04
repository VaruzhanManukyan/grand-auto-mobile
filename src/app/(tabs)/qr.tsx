import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    useWindowDimensions,
    Pressable,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Svg, {Circle, Defs, Pattern, Rect, Path, LinearGradient as SvgGradient, Stop} from 'react-native-svg';
import {Ionicons} from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    interpolate,
    Easing,
    useAnimatedProps,
} from 'react-native-reanimated';

import * as Brightness from 'expo-brightness';
import {useFocusEffect, useRouter, Stack} from 'expo-router';
import {useTranslation} from 'react-i18next';

import {useTheme} from '@/hooks/use-theme';
import {ScanLine} from '@/components/scan-line';
import {useLoyaltyStore} from '@/store/loyalty.store';
import {LoadingOverlay} from "@/components/loading";

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.6, 230);
const CARD_PADDING = 24;
const CODE_LIFETIME = 60;

const BASE_SVG_WIDTH = 220;
const BASE_SVG_HEIGHT = 160;
const BASE_RADIUS = 80;
const GAUGE_ANGLE = 240;

const AnimatedPath = Animated.createAnimatedComponent(Path);

function generateBonusCode(): string {
    return Math.floor(100000000 + Math.random() * 899999999)
        .toString()
        .slice(0, 9);
}

function formatCode(code: string): string {
    return code.match(/.{1,3}/g)?.join(' ') ?? code;
}

function useSpeedometerGeometry() {
    const {width: screenWidth} = useWindowDimensions();

    return useMemo(() => {
        const svgWidth = Math.min(Math.max(screenWidth * 0.58, 190), 260);
        const scale = svgWidth / BASE_SVG_WIDTH;

        const svgHeight = BASE_SVG_HEIGHT * scale;
        const radius = BASE_RADIUS * scale;
        const centerX = svgWidth / 2;
        const centerY = centerX; // same ratio as the original design

        const circumference = 2 * Math.PI * radius;
        const arcLength = (GAUGE_ANGLE / 360) * circumference;
        const strokeDasharray = `${arcLength} ${circumference}`;

        const gapHalf = (360 - GAUGE_ANGLE) / 2;
        const startAngle = ((90 + gapHalf) * Math.PI) / 180;
        const endAngle = ((90 - gapHalf) * Math.PI) / 180;

        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);

        const arcPath = `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 1 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;

        const needleLength = radius - 12 * scale;

        return {
            svgWidth,
            svgHeight,
            radius,
            centerX,
            centerY,
            scale,
            arcLength,
            strokeDasharray,
            arcPath,
            needleLength,
        };
    }, [screenWidth]);
}

function GlowOrb({
                     color,
                     size,
                     positionStyle,
                     duration = 8000,
                     delay = 0,
                 }: {
    color: string;
    size: number;
    positionStyle: object;
    duration?: number;
    delay?: number;
}) {
    const t = useSharedValue(0);

    useEffect(() => {
        t.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, {duration, easing: Easing.inOut(Easing.sin)}),
                -1,
                true,
            ),
        );
    }, []);

    const animStyle = useAnimatedStyle(() => {
        const scale = interpolate(t.value, [0, 1], [0.85, 1.15]);
        const translateY = interpolate(t.value, [0, 1], [0, 16]);
        const opacity = interpolate(t.value, [0, 1], [0.3, 0.55]);
        return {transform: [{scale}, {translateY}], opacity};
    });

    return (
        <Animated.View
            style={[
                bgStyles.glowOrb,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowRadius: size * 0.35,
                },
                positionStyle,
                animStyle,
            ]}
        />
    );
}

function CarBackground({theme}: { theme: any }) {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                    <Pattern
                        id="dotGrid"
                        width={26}
                        height={26}
                        patternUnits="userSpaceOnUse"
                    >
                        <Circle cx={2} cy={2} r={1.1} fill={theme.textSecondary} opacity={0.12}/>
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)"/>
            </Svg>

            <GlowOrb
                color={theme.accentSoft}
                size={260}
                positionStyle={{top: -90, left: -70}}
                duration={7000}
            />
            <GlowOrb
                color={theme.accent}
                size={220}
                positionStyle={{bottom: -70, right: -80}}
                duration={9000}
                delay={1500}
            />
        </View>
    );
}

function LoyaltySpeedometer({points, maxPoints, totalPoints, tierLabel, theme, levelColor}: {
    points: number;
    maxPoints: number;
    totalPoints: number;
    tierLabel: string;
    theme: any;
    levelColor: string
}) {
    const {
        svgWidth,
        svgHeight,
        centerX,
        centerY,
        scale,
        arcLength,
        strokeDasharray,
        arcPath,
        needleLength,
    } = useSpeedometerGeometry();

    const progress = useSharedValue(0);
    const rawPercentage = maxPoints > 0 ? points / maxPoints : 1;
    const targetPercentage = Number.isFinite(rawPercentage)
        ? Math.min(Math.max(rawPercentage, 0), 1)
        : 1;

    useFocusEffect(
        useCallback(() => {
            progress.value = 0;
            progress.value = withTiming(targetPercentage, {
                duration: 1400,
                easing: Easing.out(Easing.cubic),
            });
        }, [targetPercentage])
    );

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = arcLength - (arcLength * progress.value);
        return {strokeDashoffset};
    });

    const needleStyle = useAnimatedStyle(() => {
        const rotation = interpolate(progress.value, [0, 1], [-120, 120]);
        return {
            transform: [{rotate: `${rotation}deg`}],
        };
    });

    return (
        <View style={styles.speedoContainer}>
            <View style={[styles.speedoInstrument, {width: svgWidth, height: svgHeight}]}>
                <Svg width={svgWidth} height={svgHeight}>
                    <Defs>
                        <SvgGradient id="speedoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={theme.accentSoft || '#ff0000'}/>
                            <Stop offset="100%" stopColor={theme.accent || '#ff0000'}/>
                        </SvgGradient>
                    </Defs>

                    <Path
                        d={arcPath}
                        fill="none"
                        stroke={theme.borderAccent}
                        strokeWidth={6 * scale}
                        strokeLinecap="round"
                        opacity={0.25}
                    />

                    <AnimatedPath
                        d={arcPath}
                        fill="none"
                        stroke="url(#speedoGrad)"
                        strokeWidth={7 * scale}
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        animatedProps={animatedProps}
                    />
                </Svg>

                <Animated.View
                    style={[
                        styles.needleWrapper,
                        {
                            width: svgWidth,
                            height: svgWidth,
                            top: centerY - svgWidth / 2,
                            left: centerX - svgWidth / 2,
                        },
                        needleStyle,
                    ]}
                >
                    <View
                        style={[
                            styles.needleLine,
                            {
                                backgroundColor: theme.accent || '#ff0000',
                                width: 3 * scale,
                                height: needleLength,
                                top: (svgWidth / 2) - needleLength,
                            },
                        ]}
                    />
                </Animated.View>

                <View
                    style={[
                        styles.needleCenterPin,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.accent || '#ff0000',
                            width: 12 * scale,
                            height: 12 * scale,
                            borderRadius: 6 * scale,
                            top: centerY - 6 * scale,
                            left: centerX - 6 * scale,
                        },
                    ]}
                />

                <View
                    style={[
                        styles.tierBadge,
                        {
                            backgroundColor: theme.background,
                            borderColor: theme.accent,
                            marginTop: -24 * scale,
                        },
                    ]}
                >
                    <View style={[styles.tierDot, {backgroundColor: levelColor || theme.accent || '#ff0000'}]}/>
                    <Text style={[styles.tierLabelText, {color: theme.textPrimary}]}>{tierLabel.toUpperCase()}</Text>
                </View>

                <View style={[styles.speedoTextOverlay, {top: centerY + 56 * scale}]}>
                    <Text style={[styles.speedoPoints, {color: theme.textPrimary}]}>{totalPoints.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
}

const bgStyles = StyleSheet.create({
    glowOrb: {
        position: 'absolute',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.9,
    },
});

export default function LoyaltyScreen() {
    const theme = useTheme();
    const router = useRouter();
    const {t} = useTranslation();
    const {user, progress, isLoading, fetch} = useLoyaltyStore();

    const [code, setCode] = useState(generateBonusCode);
    const [secondsLeft, setSecondsLeft] = useState(CODE_LIFETIME);

    const glow = useSharedValue(0.5);
    const ringProgress = useSharedValue(1);

    const speedoOpacity = useSharedValue(0);
    const speedoTranslateY = useSharedValue(18);

    useEffect(() => {
        fetch();
    }, []);

    useFocusEffect(
        useCallback(() => {
            let originalBrightness = 0.5;

            const maximizeBrightness = async () => {
                try {
                    originalBrightness = await Brightness.getBrightnessAsync();
                    await Brightness.setBrightnessAsync(1.0);
                } catch (error) {
                    console.warn('Failed to adjust system window brightness:', error);
                }
            };

            maximizeBrightness();

            return () => {
                Brightness.setBrightnessAsync(originalBrightness).catch(() => {
                });
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            speedoOpacity.value = 0;
            speedoTranslateY.value = 18;

            speedoOpacity.value = withTiming(1, {duration: 480, easing: Easing.out(Easing.cubic)});
            speedoTranslateY.value = withTiming(0, {duration: 480, easing: Easing.out(Easing.cubic)});
        }, [])
    );

    useEffect(() => {
        glow.value = withRepeat(
            withSequence(
                withTiming(1, {duration: 1400, easing: Easing.inOut(Easing.sin)}),
                withTiming(0.45, {duration: 1400, easing: Easing.inOut(Easing.sin)}),
            ),
            -1,
            true,
        );
    }, []);

    const refreshCode = useCallback(() => {
        setCode(generateBonusCode());
        setSecondsLeft(CODE_LIFETIME);
        ringProgress.value = 1;
        ringProgress.value = withTiming(0, {
            duration: CODE_LIFETIME * 1000,
            easing: Easing.linear,
        });
    }, []);

    useEffect(() => {
        if (secondsLeft <= 0) {
            refreshCode();
        }
    }, [secondsLeft, refreshCode]);

    useEffect(() => {
        ringProgress.value = withTiming(0, {
            duration: CODE_LIFETIME * 1000,
            easing: Easing.linear,
        });

        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
        transform: [{scale: 0.94 + glow.value * 0.08}],
    }));

    const speedoEntranceStyle = useAnimatedStyle(() => ({
        opacity: speedoOpacity.value,
        transform: [{translateY: speedoTranslateY.value}],
    }));

    if (isLoading || !user || !progress) {
        return <View style={{flex: 1}}><LoadingOverlay visible/></View>;
    }

    const {level, currentValueInLevel, maxValueInLevel, amountToNextLevel, isMaxLevel} = progress;
    const qrValue = user.qrValue || `GRANDAUTO:BONUS:${user.id}:${code}`;

    return (
        <LinearGradient colors={[theme.background, theme.background]} style={styles.screen}>
            <Stack.Screen options={{headerShown: false, title: ''}}/>
            <CarBackground theme={theme}/>
            <View style={styles.moreButtonContainer}>
                <Pressable
                    onPress={() => router.push('/loyalty/rules')}
                    hitSlop={16}
                    style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}
                >
                    <Ionicons name="ellipsis-vertical" size={26} color={theme.textPrimary}/>
                </Pressable>
            </View>

            <View style={styles.qrZone}>
                <Animated.View
                    style={[
                        styles.glowLayer,
                        {backgroundColor: theme.accentSoft, shadowColor: theme.accent},
                        glowStyle,
                    ]}
                />

                <View
                    style={[
                        styles.card,
                        {backgroundColor: theme.qrBackground, borderColor: theme.border},
                    ]}
                >
                    <View style={{width: QR_SIZE, height: QR_SIZE}}>
                        <QRCode
                            value={qrValue}
                            size={QR_SIZE}
                            color={theme.qrForeground || '#000000'}
                            backgroundColor={theme.qrBackground || '#ffffff'}
                        />
                        <ScanLine size={QR_SIZE} color={theme.scanLine}/>
                    </View>

                    <View style={[styles.corner, styles.cornerTL, {borderColor: theme.accent}]}/>
                    <View style={[styles.corner, styles.cornerTR, {borderColor: theme.accent}]}/>
                    <View style={[styles.corner, styles.cornerBL, {borderColor: theme.accent}]}/>
                    <View style={[styles.corner, styles.cornerBR, {borderColor: theme.accent}]}/>
                </View>
            </View>

            <View style={styles.manualBlock}>
                <View style={styles.codeRow}>
                    <Text style={[styles.codeText, {color: theme.textPrimary}]}>
                        {formatCode(code)}
                    </Text>
                </View>
            </View>
            <Text style={[styles.bonusesTotalPoints, {color: theme.text}]}>
                {user.currentBonusBalance.toLocaleString()}
            </Text>
            <Text style={[styles.bonusesTotal, {color: theme.textSecondary}]}>
                {t('loyalty.activeBonuses')}
            </Text>

            <Animated.View style={speedoEntranceStyle}>
                <LoyaltySpeedometer
                    points={currentValueInLevel}
                    maxPoints={maxValueInLevel}
                    totalPoints={user.totalBonusesEarned}
                    tierLabel={t(`loyalty.status.${level.id}`)}
                    theme={theme}
                    levelColor={level.color}
                />
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    qrZone: {
        marginTop: 18,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: QR_SIZE + CARD_PADDING * 2,
    },
    moreButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 25,
        zIndex: 20,
    },
    glowLayer: {
        position: 'absolute',
        width: QR_SIZE + CARD_PADDING * 2 + 20,
        height: QR_SIZE + CARD_PADDING * 2 + 20,
        borderRadius: 36,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.9,
        shadowRadius: 30,
    },
    card: {
        padding: CARD_PADDING,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        elevation: 6,
        width: '100%',
    },
    corner: {
        position: 'absolute',
        width: 22,
        height: 22,
        borderWidth: 3,
    },
    cornerTL: {top: 11, left: 11, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 15},
    cornerTR: {top: 11, right: 11, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 15},
    cornerBL: {bottom: 11, left: 11, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 15},
    cornerBR: {bottom: 11, right: 11, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 15},
    manualBlock: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    codeText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
        fontVariant: ['tabular-nums'],
    },
    speedoContainer: {
        width: '100%',
        paddingHorizontal: 24,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "transparent",
    },
    speedoInstrument: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    speedoTextOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedoPoints: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    needleWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
    },
    needleLine: {
        position: 'absolute',
        borderRadius: 4,
    },
    needleCenterPin: {
        position: 'absolute',
        borderWidth: 2.5,
        zIndex: 10,
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    tierDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    tierLabelText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    bonusesTotalPoints: {
        fontSize: 48,
        marginTop: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    bonusesTotal: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});