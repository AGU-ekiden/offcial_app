import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { NewsRow } from '@/components/cards';
import { Card, DataGate, Divider, EmptyState, Screen, Segmented, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { monthLabel } from '@/data/format';
import { groupByMonth } from '@/data/select';
import { useAppData } from '@/data/store';

type Filter = 'all' | '結果' | '予定' | 'お知らせ';

export default function NewsScreen() {
  return (
    <Screen title="新着">
      <DataGate>
        <NewsContent />
      </DataGate>
    </Screen>
  );
}

function NewsContent() {
  const { data } = useAppData();
  const [filter, setFilter] = useState<Filter>('all');
  if (!data) return null;
  const items = data.news.filter(n => filter === 'all' || n.tag === filter);
  const groups = groupByMonth(items, n => monthLabel(n.date));
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Segmented<Filter>
          style={{ minWidth: 320, flex: 1 }}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'すべて' },
            { value: '結果', label: '結果' },
            { value: '予定', label: '予定' },
            { value: 'お知らせ', label: 'お知らせ' },
          ]}
        />
      </ScrollView>
      {groups.length === 0 ? <EmptyState icon="news" title="まだニュースはありません" /> : null}
      {groups.map(g => (
        <View key={g.key} style={{ gap: Spacing.sm }}>
          <Text variant="overline" tone="secondary">
            {g.key}
          </Text>
          <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
            {g.items.map((n, i) => (
              <View key={n.id}>
                {i > 0 ? <Divider /> : null}
                <NewsRow item={n} />
              </View>
            ))}
          </Card>
        </View>
      ))}
    </>
  );
}
