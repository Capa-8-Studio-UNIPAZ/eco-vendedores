import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#131938',
          borderTopColor: 'rgba(160,172,220,0.15)',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#2FD27A',
        tabBarInactiveTintColor: '#A9B2D0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catálogo UNIPAZ',
          tabBarLabel: 'Catálogo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="storefront-outline"
              size={size}
              color={typeof color === 'string' ? color : '#A9B2D0'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Mi Puesto / Perfil',
          tabBarLabel: 'Mi Puesto',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size}
              color={typeof color === 'string' ? color : '#A9B2D0'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
