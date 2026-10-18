import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { MeetCard } from '@/components/cards';
import { Icon } from '@/components/icon';
import {
  Card,
  DataGate,
  Divider,
  EmptyState,
  Pill,
  Row,
  Screen,
  SiteLink,
  Text,
  genderColor,
  openExternal,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { daysUntil, scheduleDateLabel } from '@/data/format';
import { useAppData } from '@/data/store';
import type { AppData, ScheduleItem } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

export default function ScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const item = data?.schedule.find(s => s.id === id);
  return (
    <>
      <Stack.Screen options={{ title: item?.name ?? '大会予定' }} />
      <Screen>
        <DataGate>
          {item && data ? (
            <ScheduleDetail item={item} data={data} />
          ) : (
            <EmptyState icon="calendar" title="予定が見つかりません" />
          )}
        </DataGate>
      </Screen>
    </>
  );
}

function ScheduleDetail({ item, data }: { item: ScheduleItem; data: AppData }) {
  const t = useTheme();
  const days = daysUntil(item.date);
  // 同じ名前・近い日付の結果があれば案内する
  const result = data.meets.find(m => m.name === item.name && Math.abs(daysUntil(m.date) - days) <= 3);
  return (
    <>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {item.category ? <Pill label={item.category} color={t.mid} /> : null}
          {item.target ? <Pill label={item.target} color={genderColor(t, item.target)} /> : null}
        </View>
        <Text variant="title" style={{ fontSize: 24, lineHeight: 32 }}>
          {item.name}
        </Text>
        {!item.undetermined && days > 0 ? (
          <Text variant="headline" tone="tint">
            あと{days}日
          </Text>
        ) : null}
      </View>
      <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
        <Row icon="calendar" title={scheduleDateLabel(item)} subtitle="日程" />
        {item.venue ? (
          <>
            <Divider inset={32} />
            <Row icon="location" title={item.venue} subtitle="会場" />
          </>
        ) : null}
      </Card>
      {item.detail ? <Text variant="body">{item.detail}</Text> : null}
      {result ? (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="headline">結果</Text>
          <MeetCard meet={result} />
        </View>
      ) : null}
      {item.links.length ? (
        <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
          {item.links.map((l, i) => (
            <View key={l.url}>
              {i > 0 ? <Divider inset={32} /> : null}
              <Row
                icon="external"
                title={l.name || '大会のページ'}
                subtitle={l.url.replace(/^https?:\/\//, '').split('/')[0]}
                onPress={() => openExternal(l.url)}
                showChevron={false}
                right={<Icon name="chevron" size={14} color={t.textTertiary} />}
              />
            </View>
          ))}
        </Card>
      ) : null}
      <SiteLink label="大会予定を公式サイトで見る" url={data.links.schedule} />
    </>
  );
}
