import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme, PlatformColor, Platform } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];


    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            iconColor={{
                default: colors.icon,
                selected: colors.iconSelected
            }}
            labelStyle={{
                default: { color: colors.text },
                selected: { color: colors.textSelected }
            }}>

            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="services">
                <NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/service.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="qr">
                <NativeTabs.Trigger.Label hidden />
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/qr_ios.png')}
                    renderingMode="original"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="cars">
                <NativeTabs.Trigger.Label>Cars</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/car.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="more">
                <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/more.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}