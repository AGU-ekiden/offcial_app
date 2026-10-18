import * as Application from 'expo-application';
import { router } from 'expo-router';
import { Linking, Switch, View } from 'react-native';

import { Avatar, Button, Card, Divider, Row, Screen, Text, openExternal } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatDate, todayIso } from '@/data/format';
import { useAppData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { usePrefs, type TopicKey } from '@/notifications/prefs';

const TOPICS: { key: TopicKey; title: string; subtitle: string }[] = [
  { key: 'news', title: 'ニュース', subtitle: 'お知らせ・大会予定などが出たとき' },
  { key: 'results', title: '大会結果', subtitle: '大会の結果が掲載されたとき（大会ごとに1回）' },
  { key: 'videos', title: '限定動画', subtitle: '新しい動画が公開されたとき' },
];

export default function SettingsScreen() {
  const t = useTheme();
  const { data } = useAppData();
  const { prefs, permission, pushAvailable, enableNotifications, setTopic, setFollowing } = usePrefs();
  const active = prefs.enabled && permission === 'granted';
  const followed = (data?.members ?? []).filter(m => prefs.follows.includes(m.id));

  return (
    <Screen refreshable={false}>
      <View style={{ gap: Spacing.sm }}>
        <Text variant="title">通知</Text>
        {!pushAvailable ? (
          <Text variant="callout" tone="secondary">
            このビルドでは通知を受け取れません。ストア版・テスト版のアプリで使えます。
          </Text>
        ) : permission === 'denied' ? (
          <Card style={{ gap: Spacing.md }}>
            <Text variant="callout">
              通知がオフになっています。端末の設定アプリで、このアプリの通知をオンにしてください。
            </Text>
            <Button label="設定アプリを開く" kind="secondary" onPress={() => Linking.openSettings()} />
          </Card>
        ) : !active ? (
          <Button label="通知を受け取る" icon="bell" onPress={enableNotifications} />
        ) : null}
      </View>

      <Card padded={false} style={{ paddingHorizontal: Spacing.lg, opacity: active || !pushAvailable ? 1 : 0.55 }}>
        {TOPICS.map((tp, i) => (
          <View key={tp.key}>
            {i > 0 ? <Divider /> : null}
            <Row
              title={tp.title}
              subtitle={tp.subtitle}
              right={
                <Switch
                  value={prefs.topics[tp.key]}
                  onValueChange={v => setTopic(tp.key, v)}
                  trackColor={{ true: t.tint }}
                  accessibilityLabel={`${tp.title}の通知`}
                />
              }
            />
          </View>
        ))}
      </Card>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="title">結果の通知を受け取る選手</Text>
        <Text variant="caption" tone="secondary">
          部員のページで選ぶと、その選手の結果が掲載されたときにお知らせします。
        </Text>
        {followed.length ? (
          <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
            {followed.map((m, i) => (
              <View key={m.id}>
                {i > 0 ? <Divider /> : null}
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm }}>
                  <Avatar uri={m.photo} name={m.name} size={32} radius={8} />
                  <Text
                    variant="callout"
                    style={{ flex: 1, fontWeight: '600' }}
                    onPress={() => router.push({ pathname: '/member/[id]', params: { id: m.id } })}>
                    {m.name}
                  </Text>
                  <Switch
                    value
                    onValueChange={() => setFollowing(m.id, false)}
                    trackColor={{ true: t.tint }}
                    accessibilityLabel={`${m.name}の結果の通知`}
                  />
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="title">このアプリについて</Text>
        <Text variant="callout" tone="secondary">
          ログインは不要です。通知の設定と選んだ選手は、この端末の中だけに保存され、部や大学には送られません。
        </Text>
        <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
          <Row icon="external" title="公式サイト" onPress={() => data && openExternal(data.siteUrl)} />
          <Divider inset={32} />
          <Row
            icon="info"
            title="プライバシーポリシー"
            onPress={() => data && openExternal(`${data.siteUrl}privacy.html`)}
          />
        </Card>
        <Text variant="caption" tone="tertiary">
          バージョン {Application.nativeApplicationVersion ?? '—'}
          {data
            ? `　データ更新 ${formatDate(todayIso(Date.parse(data.generatedAt)))} ${new Date(data.generatedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })}`
            : ''}
        </Text>
      </View>
    </Screen>
  );
}
