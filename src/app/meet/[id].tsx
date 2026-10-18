import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, DataGate, Divider, EmptyState, Pill, Screen, SiteLink, Tap, Text, genderColor } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { formatDateRange } from '@/data/format';
import { useAppData } from '@/data/store';
import type { Meet, Race, ResultRow } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

export default function MeetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const meet = data?.meets.find(m => m.id === id);
  return (
    <>
      <Stack.Screen options={{ title: meet?.name ?? '大会結果' }} />
      <Screen>
        <DataGate>
          {meet ? (
            <MeetDetail meet={meet} siteUrl={data?.links.results ?? ''} />
          ) : (
            <EmptyState
              icon="trophy"
              title="この大会の結果はアプリでは見られません"
              message="過去の記録は公式サイトでご覧ください。"
            />
          )}
        </DataGate>
      </Screen>
    </>
  );
}

function MeetDetail({ meet, siteUrl }: { meet: Meet; siteUrl: string }) {
  const t = useTheme();
  return (
    <>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {meet.category ? <Pill label={meet.category} color={t.mid} /> : null}
        </View>
        <Text variant="title" style={{ fontSize: 24, lineHeight: 32 }}>
          {meet.name}
        </Text>
        <Text variant="callout" tone="secondary">
          {[formatDateRange(meet.date, meet.dateEnd, { year: true }), meet.venue].filter(Boolean).join('　')}
        </Text>
      </View>
      {meet.races.map(r => (
        <RaceBlock key={r.key} race={r} showGender={meet.races.some(x => x.gender !== r.gender)} />
      ))}
      <SiteLink label="この大会の記録を公式サイトで見る" url={siteUrl} />
    </>
  );
}

function RaceBlock({ race, showGender }: { race: Race; showGender: boolean }) {
  const t = useTheme();
  const title = race.isEkiden ? race.label || (showGender ? race.gender : '区間記録') : race.label || '結果';
  return (
    <View style={{ gap: Spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <Text variant="headline" style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {race.gender && (showGender || race.isEkiden) ? (
          <Pill label={race.gender} color={genderColor(t, race.gender)} />
        ) : null}
      </View>
      {race.teamResults.length ? (
        <View style={styles.teamRow}>
          {race.teamResults.map(tr => (
            <View
              key={tr.part}
              style={[styles.teamBox, { backgroundColor: tr.part === '総合' ? t.green : t.tintSoft }]}>
              <Text variant="caption" style={{ color: tr.part === '総合' ? '#CDEFEC' : t.tint, fontWeight: '700' }}>
                {tr.part}
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '800', color: tr.part === '総合' ? '#fff' : t.text }} numeric>
                {tr.rank != null ? `${tr.rank}位` : '—'}
              </Text>
              <Text variant="caption" style={{ color: tr.part === '総合' ? '#E5F7F5' : t.textSecondary }} numeric>
                {tr.time}
              </Text>
              {tr.remarks ? (
                <Text variant="caption" style={{ color: tr.part === '総合' ? '#E5F7F5' : t.textSecondary }}>
                  {tr.remarks}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
        {race.rows.map((row, i) => (
          <View key={row.id || i}>
            {i > 0 ? <Divider /> : null}
            <ResultLine row={row} ekiden={race.isEkiden} />
          </View>
        ))}
      </Card>
    </View>
  );
}

function ResultLine({ row, ekiden }: { row: ResultRow; ekiden: boolean }) {
  const t = useTheme();
  const lead = ekiden ? (row.kukan ? `${row.kukan}区` : '') : row.rank != null ? String(row.rank) : '—';
  return (
    <View style={styles.line}>
      <View style={[styles.lead, { backgroundColor: t.surfaceMuted }]}>
        <Text variant="caption" style={{ fontWeight: '800', color: t.tint }} numeric>
          {lead}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.sm }}>
          {row.athletes.map((a, i) =>
            a.id ? (
              <Tap
                key={`${a.name}-${i}`}
                onPress={() => router.push({ pathname: '/member/[id]', params: { id: a.id! } })}
                accessibilityRole="link">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text variant="callout" style={{ fontWeight: '700' }}>
                    {a.name}
                  </Text>
                  <Icon name="chevron" size={10} color={t.textTertiary} />
                </View>
              </Tap>
            ) : (
              <Text key={`${a.name}-${i}`} variant="callout" style={{ fontWeight: '700' }}>
                {a.name}
              </Text>
            ),
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {ekiden && row.distanceKm ? (
            <Text variant="caption" tone="tertiary">
              {row.distanceKm}km
            </Text>
          ) : null}
          {ekiden && row.rank != null ? (
            <Text variant="caption" tone="secondary">
              区間{row.rank}位
            </Text>
          ) : null}
          {row.flags.map(f => (
            <Pill key={f} label={f} color={t.gold} />
          ))}
        </View>
      </View>
      <Text variant="headline" numeric>
        {row.time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  teamRow: { flexDirection: 'row', gap: Spacing.sm },
  teamBox: { flex: 1, borderRadius: Radius.md, padding: Spacing.md, gap: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  lead: {
    minWidth: 36,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
