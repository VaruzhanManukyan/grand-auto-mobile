import React from 'react';
import {View, Text, StyleSheet, ScrollView, Platform, StatusBar} from 'react-native';
import {Stack} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {Ionicons} from '@expo/vector-icons';
import {getAllLevels} from '@/utils/loyalty.levels';
import {useTheme} from '@/hooks/use-theme';

export default function LoyaltyRulesScreen() {
    const {t} = useTranslation();
    const theme = useTheme();
    const levels = getAllLevels();

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}/>

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: '',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTintColor: theme.textPrimary,
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollPadding}
                showsVerticalScrollIndicator={false}
            >
                {levels.map((lvl) => (
                    <View
                        key={lvl.id}
                        style={[styles.card, {borderColor: lvl.color, backgroundColor: theme.cardBackground}]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.dot, {backgroundColor: lvl.color}]}/>
                            <Text style={[styles.cardTitle, {color: lvl.color}]}>{t(`loyalty.status.${lvl.id}`)}</Text>
                            <Text style={[styles.bonusBadge, {color: lvl.color, borderColor: lvl.color}]}>
                                {t('loyalty.rulesScreen.levelCard.bonus', {percent: lvl.bonusPercent})}
                            </Text>
                        </View>
                        <Text style={[styles.cardRange, {color: theme.textSecondary}]}>
                            {t('loyalty.rulesScreen.levelCard.unbound', {from: lvl.minAmount.toLocaleString()})}
                        </Text>
                    </View>
                ))}

                <View style={[styles.howItWorksContainer, {borderTopColor: theme.border}]}>
                    <Text style={[styles.howItWorksTitle, {color: theme.textPrimary}]}>
                        {t('loyalty.rulesScreen.howItWorks.title')}
                    </Text>

                    <View style={styles.stepItem}>
                        <View style={[styles.stepIconWrapper, {backgroundColor: theme.backgroundElement}]}>
                            <Ionicons name="qr-code-outline" size={20} color={theme.textPrimary}/>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, {color: theme.textPrimary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step1Title')}
                            </Text>
                            <Text style={[styles.stepDescription, {color: theme.textSecondary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step1Desc')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={[styles.stepIconWrapper, {backgroundColor: theme.backgroundElement}]}>
                            <Ionicons name="sparkles-outline" size={20} color={theme.textPrimary}/>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, {color: theme.textPrimary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step2Title')}
                            </Text>
                            <Text style={[styles.stepDescription, {color: theme.textSecondary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step2Desc')}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={[styles.stepIconWrapper, {backgroundColor: theme.backgroundElement}]}>
                            <Ionicons name="trending-up-outline" size={20} color={theme.textPrimary}/>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, {color: theme.textPrimary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step3Title')}
                            </Text>
                            <Text style={[styles.stepDescription, {color: theme.textSecondary}]}>
                                {t('loyalty.rulesScreen.howItWorks.step3Desc')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollPadding: {
        paddingTop: Platform.OS === 'ios' ? 116 : 100,
        paddingHorizontal: 20,
        paddingBottom: 50,
        gap: 12,
    },
    card: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    bonusBadge: {
        fontSize: 12,
        fontWeight: '700',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    cardRange: {
        fontSize: 13,
        marginTop: 8,
    },
    howItWorksContainer: {
        marginTop: 12,
        paddingTop: 24,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    howItWorksTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 20,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 14,
    },
    stepIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
});