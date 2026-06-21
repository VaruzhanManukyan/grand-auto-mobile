import {StyleSheet, View, LayoutChangeEvent, useColorScheme} from 'react-native';
import {Tabs, TabList, TabTrigger, TabSlot} from 'expo-router/ui';
import {TabButton} from "@/components/tab-button";
import {usePathname} from "expo-router";
import {useSharedValue} from 'react-native-reanimated';
import {Colors} from "@/constants/theme";

const routes = [
    {name: 'home', href: '/', label: 'Home'},
    {name: 'services', href: '/services', label: 'Services'},
    {name: 'placeholder', href: '#', label: ''},
    {name: 'cars', href: '/cars', label: 'Cars'},
    {name: 'more', href: '/more', label: 'More'},
];

export default function AppTabs() {
    const pathname = usePathname();
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme];
    const barWidth = useSharedValue(0);

    const onLayoutBar = (event: LayoutChangeEvent) => {
        barWidth.value = event.nativeEvent.layout.width;
    };

    return (
        <Tabs>
            <TabSlot/>

            <TabList style={{display: 'none'}}>
                <TabTrigger name="home" href="/"/>
                <TabTrigger name="services" href="/services"/>
                <TabTrigger name="cars" href="/cars"/>
                <TabTrigger name="more" href="/more"/>
                <TabTrigger name="qr" href="/qr"/>
            </TabList>

            <View style={styles.container}>
                <View style={[styles.tabbar, {backgroundColor: colors.backgroundBar}]} onLayout={onLayoutBar}>


                    {routes.map((r) => {
                        if (r.name === 'placeholder') {
                            return <View key="placeholder" style={{flex: 1}}/>;
                        }
                        return (
                            <TabTrigger key={r.name} name={r.name} asChild>
                                <TabButton label={r.label} focused={pathname === r.href}/>
                            </TabTrigger>
                        );
                    })}
                </View>

                <View style={styles.floatingButtonContainer} pointerEvents="box-none">
                    <TabTrigger name="qr" asChild>
                        <TabButton
                            label="QR"
                            focused={pathname === '/qr'}
                            isFloating={true}
                        />
                    </TabTrigger>
                </View>
            </View>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    tabbar: {
        flexDirection: 'row',
        width: '90%',
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowRadius: 12,
        shadowOpacity: 0.1,
        elevation: 5,
    },
    indicator: {
        position: 'absolute',
        height: '80%',
        borderRadius: 35,
        alignSelf: 'center',
        zIndex: -1,
    },
    floatingButtonContainer: {
        position: 'absolute',
        top: -25,
        width: 75,
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
    },
});