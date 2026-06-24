/**
 * Barra inferior flotante – bordes neón, esquinas redondeadas, halo en tab activo (Cap10).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { neonGlow, neonBlue, neonTabActiveIconCircle, neonTabActiveIconGlow } from '../lib/neonStyles';
import type { MainTabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TiendaScreen } from '../screens/TiendaScreen';
import { MisTicketsHubScreen } from '../screens/MisTicketsHubScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function tabMeta(routeName: keyof MainTabParamList): { label: string; icon: string } {
  switch (routeName) {
    case 'Home':
      return { label: 'Inicio', icon: 'home' };
    case 'Tienda':
      return { label: 'Tienda', icon: 'shopping-cart' };
    case 'MisTickets':
      return { label: 'Mis Tickets', icon: 'ticket' };
    case 'Favoritos':
      return { label: 'Favoritos', icon: 'heart' };
    case 'Profile':
      return { label: 'Perfil', icon: 'user' };
    default:
      return { label: routeName, icon: 'circle' };
  }
}

function NeonTabBar(props: BottomTabBarProps) {
  const { state, navigation } = props;
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 6);

  return (
    <View style={[styles.tabBarShell, { paddingBottom: bottomPad }]}>
      <View style={[styles.tabOuter, neonGlow(neonBlue, 'strong')]}>
        <View style={styles.tabInner}>
          {state.routes.map((route, index) => {
            const name = route.name as keyof MainTabParamList;
            const { label, icon } = tabMeta(name);
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.85}
              >
                <View style={styles.iconWrap}>
                  {focused ? (
                    <View style={[styles.iconGlowHalo, neonTabActiveIconGlow()]}>
                      <View style={neonTabActiveIconCircle()}>
                        <FontAwesome name={icon} size={22} color="#ffffff" />
                      </View>
                    </View>
                  ) : (
                    <FontAwesome name={icon} size={22} color="#7dd3fc" />
                  )}
                </View>
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <NeonTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tienda" component={TiendaScreen} />
      <Tab.Screen name="MisTickets" component={MisTicketsHubScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarShell: {
    paddingHorizontal: 14,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  tabOuter: {
    backgroundColor: 'rgba(1, 6, 25, 0.75)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(0, 102, 255, 0.9)',
    paddingTop: 2,
    paddingBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: neonBlue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 18,
      },
      android: { elevation: 48 },
    }),
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 2,
  },
  iconWrap: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlowHalo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#7dd3fc',
    textAlign: 'center',
    opacity: 0.75,
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
    opacity: 1,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(56, 189, 248, 0.9)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      },
      android: {},
    }),
  },
});
