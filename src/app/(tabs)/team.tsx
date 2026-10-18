import { useState } from 'react';
import { TextInput, View, useWindowDimensions } from 'react-native';

import { MemberTile } from '@/components/cards';
import { Icon } from '@/components/icon';
import { DataGate, EmptyState, Screen, Segmented, SiteLink, Text } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { roster } from '@/data/select';
import { useAppData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

type Gender = '全員' | '男子' | '女子';

export default function TeamScreen() {
  return (
    <Screen title="部員">
      <DataGate>
        <TeamContent />
      </DataGate>
    </Screen>
  );
}

function TeamContent() {
  const t = useTheme();
  const { data } = useAppData();
  const { width } = useWindowDimensions();
  const [gender, setGender] = useState<Gender>('全員');
  const [query, setQuery] = useState('');
  if (!data) return null;

  const hasWomen = data.members.some(m => m.gender === '女子');
  const q = query.trim().toLowerCase();
  const members = q
    ? data.members.filter(m =>
        [m.name, m.nameRoman, m.highSchool, m.faculty, m.hometown].some(v => v.toLowerCase().includes(q)),
      )
    : data.members;
  const groups = roster(members, gender);

  // 全員を同じ大きさで並べる（画面幅に合わせて3〜5列）
  const contentWidth = Math.min(width, MaxContentWidth) - Spacing.lg * 2;
  const columns = contentWidth > 560 ? 5 : contentWidth > 420 ? 4 : 3;
  const gap = Spacing.md;
  const tileWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  return (
    <>
      <View style={{ gap: Spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            backgroundColor: t.surfaceMuted,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.md,
          }}>
          <Icon name="search" size={16} color={t.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="名前・出身校・学部で探す"
            placeholderTextColor={t.textTertiary}
            style={{ flex: 1, paddingVertical: 10, fontSize: 15, color: t.text }}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="部員を探す"
          />
        </View>
        {hasWomen ? (
          <Segmented<Gender>
            value={gender}
            onChange={setGender}
            options={[
              { value: '全員', label: '全員' },
              { value: '男子', label: '男子' },
              { value: '女子', label: '女子' },
            ]}
          />
        ) : null}
      </View>
      {groups.length === 0 ? <EmptyState icon="search" title="見つかりませんでした" /> : null}
      {groups.map(g => (
        <View key={g.title} style={{ gap: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm }}>
            <Text variant="title">{g.title}</Text>
            <Text variant="caption" tone="tertiary">
              {g.members.length}人
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
            {g.members.map(m => (
              <MemberTile key={m.id} member={m} width={tileWidth} />
            ))}
          </View>
        </View>
      ))}
      <SiteLink label="部員紹介を公式サイトで見る" url={data.links.members} />
    </>
  );
}
