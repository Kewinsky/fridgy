import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#f7f7f5' },
          headerShown: false,
        }}
      />
    </AppProviders>
  );
}
