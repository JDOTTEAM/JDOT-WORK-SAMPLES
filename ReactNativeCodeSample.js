import React, { useState, useEffect } from 'react';

import {
    NavigationHelpersContext,
    useNavigationBuilder,
    createNavigatorFactory,
    TabRouter,
    TabActions,
} from '@react-navigation/native';

import { Text, Image, TouchableOpacity, View, StyleSheet } from 'react-native';

function PlacesTabBar(props) {

    const {
        children,
        contentStyle,
        height,
        paddingLeft,
        paddingRight,
        iconsForTapBar,
        labelStyles,
        iconStyles,
        activeTintColor,
        inactiveTintColor,
    } = props;

    const { state, navigation, descriptors } = useNavigationBuilder(TabRouter, {
        children,
    });

    let [currentRouteName, setCurrentRoutName] = useState(state.routes[0].name);

    return (
        <NavigationHelpersContext.Provider value={navigation}>
            <View style={[{ flex: 1 }, contentStyle]}>
                {descriptors[state.routes[state.index].key].render()}
            </View>

            <View style={{ ...styles.container, height, paddingLeft, paddingRight }}>

                <View style={[{ flexDirection: 'row', justifyContent: 'space-between' }]}>

                    {state.routes.map(route => (
                        <TouchableOpacity
                            activeOpacity={1}
                            key={route.name}
                            onPress={() => {
                                setCurrentRoutName(currentRouteName = route.name);
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,

                                });

                                if (!event.defaultPrevented) {
                                    navigation.dispatch({
                                        ...TabActions.jumpTo(route.name),
                                        target: state.key,
                                    });
                                }
                            }}
                            style={{ minWidth: 52, alignItems: 'center' }}
                        >
                            {!!iconsForTapBar && currentRouteName === route.name &&
                                <Image style={!!iconStyles ? iconStyles : styles.defaultIconsStyles}
                                    source={iconsForTapBar[route.name].focusIcon} />}
                            {!!iconsForTapBar && currentRouteName !== route.name &&
                                <Image style={!!iconStyles ? iconStyles : styles.defaultIconsStyles}
                                    source={iconsForTapBar[route.name].unFocusIcon} />}

                            <Text
                                style={[!!labelStyles ? labelStyles : styles.defaultTextStyles, { color: currentRouteName === route.name ? activeTintColor : inactiveTintColor }]}>{descriptors[route.key].options.title || route.name}</Text>
                            {currentRouteName === route.name && <View style={styles.focusLine} />}
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.unFocusLine} />


            </View>


        </NavigationHelpersContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    }, button: {
        justifyContent: 'center',
        alignItems: 'center',
    }, unFocusLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#F2F2F2',
        borderRadius: 1,
    }, focusLine: {
        maxWidth: 52,
        minWidth: 52,
        height: 2,
        backgroundColor: '#1D6FDC',
        marginTop: 8,
        borderRadius: 2,
    }, defaultTextStyles: {
        fontSize: 12,
        fontWeight: '500',
        color: '#3D426B',
        fontStyle: 'normal',
    }, defaultIconsStyles: {
        width: 24,
        height: 24,
        resizeMode: 'cover',
        marginBottom: 9,
    }, mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export const placesTabBar = createNavigatorFactory(PlacesTabBar);
