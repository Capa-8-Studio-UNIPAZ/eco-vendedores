import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0E1330',
          },
          headerTintColor: '#EEF1FA',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0E1330' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="producto/[id]"
          options={{
            title: 'Detalle del Producto',
            headerBackTitle: 'Catálogo',
          }}
        />
      </Stack>
    </>
  );
}
