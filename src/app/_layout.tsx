import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { DataProvider, useAppData } from '@/data/store';
import {
  onForegroundMessage,
  onNotificationOpen,
  registerBackgroundHandler,
  type PushData,
} from '@/notifications/firebase';
import { PrefsProvider } from '@/notifications/prefs';

SplashScreen.preventAutoHideAsync();
registerBackgroundHandler();

/** 通知をタップしたときに開く画面 */
function openFromPush(data: PushData) {
  if (data.type === 'meet' && data.id) router.push({ pathname: '/meet/[id]', params: { id: data.id } });
  else if (data.type === 'video' && data.id) router.push({ pathname: '/video/[id]', params: { id: data.id } });
  else if (data.type === 'videos') router.navigate('/videos');
  else router.navigate('/news');
}

function PushHandlers() {
  const { refresh } = useAppData();
  useEffect(() => {
    const offOpen = onNotificationOpen(data => {
      refresh();
      openFromPush(data);
    });
    const offMessage = onForegroundMessage((title, body, data) => {
      refresh();
      Alert.alert(title || 'お知らせ', body, [
        { text: '閉じる', style: 'cancel' },
        { text: '見る', onPress: () => openFromPush(data) },
      ]);
    });
    return () => {
      offOpen();
      offMessage();
    };
  }, [refresh]);
  return null;
}

function SplashGate() {
  const { status } = useAppData();
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
    // 通信が遅くても長く待たせない
    const timer = setTimeout(() => SplashScreen.hideAsync(), 2500);
    return () => clearTimeout(timer);
  }, [status]);
  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.tint,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.border,
    },
  };
  return (
    <ThemeProvider value={theme}>
      <DataProvider>
        <PrefsProvider>
          <SplashGate />
          <PushHandlers />
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerTintColor: c.tint,
              headerTitleStyle: { color: c.text },
              headerBackButtonDisplayMode: 'minimal',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: c.background },
              contentStyle: { backgroundColor: c.background },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'ホーム' }} />
            <Stack.Screen name="member/[id]" options={{ title: '' }} />
            <Stack.Screen name="meet/[id]" options={{ title: '大会結果' }} />
            <Stack.Screen name="schedule/[id]" options={{ title: '大会予定' }} />
            <Stack.Screen name="video/[id]" options={{ title: '限定動画' }} />
            <Stack.Screen name="settings" options={{ title: '通知とアプリの設定', presentation: 'modal' }} />
          </Stack>
        </PrefsProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
