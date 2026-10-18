// Firebase Cloud Messaging の薄いラッパー。
// Firebase を組み込んでいないビルド（Expo Go・Web・設定ファイルなしの開発ビルド）では何もしない。
// 端末の登録やトークンの保存はせず、トピックの購読だけで通知を受け取る（ログイン不要）。

import Constants from 'expo-constants';
import { Platform } from 'react-native';

type MessagingModule = typeof import('@react-native-firebase/messaging');
type Messaging = ReturnType<MessagingModule['getMessaging']>;
export type PushData = Record<string, string>;

let cached: { mod: MessagingModule; messaging: Messaging } | null | undefined;

function load() {
  if (cached !== undefined) return cached;
  cached = null;
  if (Platform.OS === 'web' || !Constants.expoConfig?.extra?.firebase) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: MessagingModule = require('@react-native-firebase/messaging');
    cached = { mod, messaging: mod.getMessaging() };
  } catch {
    cached = null;
  }
  return cached;
}

export function isPushAvailable() {
  return !!load();
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

function toState(mod: MessagingModule, status: number): PermissionState {
  const S = mod.AuthorizationStatus;
  if (status === S.AUTHORIZED || status === S.PROVISIONAL || status === S.EPHEMERAL) return 'granted';
  if (status === S.DENIED) return 'denied';
  return 'undetermined';
}

export async function getPermission(): Promise<PermissionState> {
  const fb = load();
  if (!fb) return 'unavailable';
  return toState(fb.mod, await fb.mod.hasPermission(fb.messaging));
}

export async function requestPermission(): Promise<PermissionState> {
  const fb = load();
  if (!fb) return 'unavailable';
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    // Android 13 以降は通知の許可を別に求める
    const { PermissionsAndroid } = await import('react-native');
    const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (r !== PermissionsAndroid.RESULTS.GRANTED) return 'denied';
  }
  return toState(fb.mod, await fb.mod.requestPermission(fb.messaging));
}

export async function subscribe(topic: string) {
  const fb = load();
  if (fb) await fb.mod.subscribeToTopic(fb.messaging, topic);
}

export async function unsubscribe(topic: string) {
  const fb = load();
  if (fb) await fb.mod.unsubscribeFromTopic(fb.messaging, topic);
}

/** 通知をタップしてアプリを開いたときの処理を登録する。戻り値で解除 */
export function onNotificationOpen(handler: (data: PushData) => void): () => void {
  const fb = load();
  if (!fb) return () => {};
  fb.mod.getInitialNotification(fb.messaging).then(m => {
    if (m?.data) handler(m.data as PushData);
  });
  return fb.mod.onNotificationOpenedApp(fb.messaging, m => {
    if (m.data) handler(m.data as PushData);
  });
}

/** アプリを開いている間に届いた通知 */
export function onForegroundMessage(handler: (title: string, body: string, data: PushData) => void): () => void {
  const fb = load();
  if (!fb) return () => {};
  return fb.mod.onMessage(fb.messaging, m => {
    handler(m.notification?.title ?? '', m.notification?.body ?? '', (m.data ?? {}) as PushData);
  });
}

/** アプリを閉じている間の通知は OS が表示する。ここでは何もしない（登録しないと警告が出るため） */
export function registerBackgroundHandler() {
  const fb = load();
  if (fb) fb.mod.setBackgroundMessageHandler(fb.messaging, async () => {});
}
