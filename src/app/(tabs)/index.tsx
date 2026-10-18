import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MeetCard, NewsRow, NextRaceHero, VideoCard } from '@/components/cards';
import { Icon } from '@/components/icon';
import { Button, Card, DataGate, Divider, Screen, Section, SiteLink, Tap, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { nextRace } from '@/data/select';
import { useAppData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { usePrefs } from '@/notifications/prefs';

export default function HomeScreen() {
  const t = useTheme();
  return (
    <Screen
      eyebrow="青山学院大学 長距離ブロック"
      title="陸上競技部"
      right={
        <Tap onPress={() => router.push('/settings')} hitSlop={10} accessibilityLabel="通知とアプリの設定">
          <View style={[styles.iconButton, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Icon name="settings" size={20} color={t.tint} />
          </View>
        </Tap>
      }>
      <DataGate>
        <HomeContent />
      </DataGate>
    </Screen>
  );
}

function HomeContent() {
  const { data } = useAppData();
  if (!data) return null;
  const next = nextRace(data);
  const latest = data.meets[0];
  return (
    <>
      {next ? <NextRaceHero item={next} /> : null}
      <NotificationPrompt />
      {latest ? (
        <Section
          title="最新の結果"
          action="すべて"
          onAction={() => router.navigate({ pathname: '/races', params: { tab: 'results' } })}>
          <MeetCard meet={latest} />
        </Section>
      ) : null}
      {data.news.length ? (
        <Section title="新着ニュース" action="すべて" onAction={() => router.navigate('/news')}>
          <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
            {data.news.slice(0, 4).map((n, i) => (
              <View key={n.id}>
                {i > 0 ? <Divider /> : null}
                <NewsRow item={n} />
              </View>
            ))}
          </Card>
        </Section>
      ) : null}
      {data.videos.length ? (
        <Section title="限定動画" action="すべて" onAction={() => router.navigate('/videos')}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.md, paddingHorizontal: Spacing.lg }}
            style={{ marginHorizontal: -Spacing.lg }}>
            {data.videos.slice(0, 6).map(v => (
              <VideoCard key={v.id} video={v} width={240} />
            ))}
          </ScrollView>
        </Section>
      ) : null}
      <View style={{ gap: Spacing.sm }}>
        <Text variant="caption" tone="tertiary">
          過去の記録・部の紹介は公式サイトで
        </Text>
        <SiteLink label="公式サイトを開く" url={data.siteUrl} />
      </View>
    </>
  );
}

/** 通知をまだ有効にしていない人への案内 */
function NotificationPrompt() {
  const t = useTheme();
  const { prefs, loaded, pushAvailable, permission, enableNotifications } = usePrefs();
  if (!loaded || !pushAvailable || (prefs.enabled && permission === 'granted')) return null;
  const denied = permission === 'denied';
  return (
    <Card style={{ gap: Spacing.md, backgroundColor: t.tintSoft, borderColor: 'transparent' }}>
      <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
        <Icon name="bellFill" size={24} color={t.tint} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline">結果やニュースを通知で受け取る</Text>
          <Text variant="caption" tone="secondary">
            {denied
              ? '通知がオフになっています。端末の設定アプリから、このアプリの通知をオンにしてください。'
              : '大会の結果やニュースが出たら、いち早くお知らせします。'}
          </Text>
        </View>
      </View>
      {!denied ? <Button label="通知を受け取る" onPress={enableNotifications} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
