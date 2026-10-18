import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { MeetCard, ScheduleRow } from '@/components/cards';
import { Card, DataGate, Divider, EmptyState, Screen, Segmented, SiteLink, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { monthLabel } from '@/data/format';
import { groupByMonth, upcomingSchedule } from '@/data/select';
import { useAppData } from '@/data/store';

type Tab = 'schedule' | 'results';

export default function RacesScreen() {
  // 選んでいるタブは URL の ?tab= に持つ（ホームの「最新の結果」から結果タブを直接開けるように）
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const tab: Tab = params.tab === 'results' ? 'results' : 'schedule';
  const setTab = (v: Tab) => router.setParams({ tab: v });
  return (
    <Screen title="大会">
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'schedule', label: '予定' },
          { value: 'results', label: '結果' },
        ]}
      />
      <DataGate>{tab === 'schedule' ? <ScheduleList /> : <ResultList />}</DataGate>
    </Screen>
  );
}

function ScheduleList() {
  const { data } = useAppData();
  if (!data) return null;
  const items = upcomingSchedule(data);
  const fixed = items.filter(s => !s.undetermined);
  const tbd = items.filter(s => s.undetermined);
  const groups = groupByMonth(fixed, s => monthLabel(s.date));
  return (
    <>
      {items.length === 0 ? <EmptyState icon="calendar" title="予定はまだ発表されていません" /> : null}
      {groups.map(g => (
        <ScheduleGroup key={g.key} title={g.key} items={g.items} />
      ))}
      {tbd.length ? <ScheduleGroup title="日程未定" items={tbd} /> : null}
      <SiteLink label="これまでの大会予定を公式サイトで見る" url={data.links.schedule} />
    </>
  );
}

function ScheduleGroup({ title, items }: { title: string; items: ReturnType<typeof upcomingSchedule> }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Text variant="overline" tone="secondary">
        {title}
      </Text>
      <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
        {items.map((s, i) => (
          <View key={s.id}>
            {i > 0 ? <Divider inset={68} /> : null}
            <ScheduleRow item={s} />
          </View>
        ))}
      </Card>
    </View>
  );
}

function ResultList() {
  const { data } = useAppData();
  if (!data) return null;
  return (
    <>
      {data.meets.length === 0 ? <EmptyState icon="trophy" title="直近の結果はありません" /> : null}
      <View style={{ gap: Spacing.md }}>
        {data.meets.map(m => (
          <MeetCard key={m.id} meet={m} />
        ))}
      </View>
      <View style={{ gap: Spacing.sm }}>
        <Text variant="caption" tone="tertiary">
          アプリでは直近1年ほどの結果を表示しています
        </Text>
        <SiteLink label="過去の記録・歴代ランキングは公式サイトで" url={data.links.results} />
      </View>
    </>
  );
}
