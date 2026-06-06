/**
 * Barra inferior estilo mockup (neón azul, ícono activo con halo).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.tabOuter, { paddingBottom: bottomPad }]}>
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
                  <View style={styles.iconGlow}>
                    <FontAwesome name={icon} size={22} color="#ffffff" />
                  </View>
                ) : (
                  <FontAwesome name={icon} size={22} color="#64748b" />
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
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <NeonTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tienda" component={TiendaScreen} />
      <Tab.Screen name="MisTickets" component={MisTicketsHubScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabOuter: {
    backgroundColor: 'rgba(8, 18, 40, 0.96)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(96, 165, 250, 0.45)',
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 2,
  },
  iconWrap: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(147, 197, 253, 0.65)',
    ...Platform.select({
      ios: {
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.95,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#f8fafc',
  },
});
