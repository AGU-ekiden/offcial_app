import fs from 'node:fs';

import type { ConfigContext, ExpoConfig } from 'expo/config';

// Firebase（通知）の設定ファイル。EAS Build では「ファイル」型の環境変数で渡す（README 参照）。
// どちらも無いときは Firebase を組み込まずにビルドする（通知以外はそのまま動く）。
const iosFirebaseFile = process.env.GOOGLE_SERVICES_PLIST ?? './firebase/GoogleService-Info.plist';
const androidFirebaseFile = process.env.GOOGLE_SERVICES_JSON ?? './firebase/google-services.json';
const hasFirebase = fs.existsSync(iosFirebaseFile) && fs.existsSync(androidFirebaseFile);

// ストアに出す名義が決まったら変える（docs/app-plan.md「決めること」）
const BUNDLE_ID = 'com.aogakutf.official';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '青学駅伝',
  slug: 'agu-ekiden',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'aguekiden',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    ...(hasFirebase && { googleServicesFile: iosFirebaseFile }),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: BUNDLE_ID,
    ...(hasFirebase && { googleServicesFile: androidFirebaseFile }),
    adaptiveIcon: {
      backgroundColor: '#005C59',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#005C59',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-video',
    [
      'expo-build-properties',
      // React Native Firebase は iOS で static frameworks が必要
      { ios: { useFrameworks: 'static' } },
    ],
    ...(hasFirebase ? ['@react-native-firebase/app', '@react-native-firebase/messaging'] : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    firebase: hasFirebase,
  },
});
