import { Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  Avatar,
  Card,
  DataGate,
  Divider,
  EmptyState,
  Pill,
  Screen,
  SiteLink,
  Tap,
  Text,
  genderColor,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { formatDot, memberSubtitle } from '@/data/format';
import { findMember } from '@/data/select';
import { useAppData } from '@/data/store';
import type { Member } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { usePrefs } from '@/notifications/prefs';

export default function MemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const member = findMember(data, id);
  return (
    <>
      <Stack.Screen options={{ title: member?.name ?? '' }} />
      <Screen>
        <DataGate>
          {member ? <MemberDetail member={member} /> : <EmptyState icon="team" title="部員が見つかりません" />}
        </DataGate>
      </Screen>
    </>
  );
}

function MemberDetail({ member: m }: { member: Member }) {
  const t = useTheme();
  const profile: [string, string][] = (
    [
      ['学部', m.faculty],
      ['出身校', m.highSchool],
      ['出身地', m.hometown],
    ] as [string, string][]
  ).filter(([, v]) => v);

  return (
    <>
      <View style={styles.head}>
        <Avatar uri={m.photo} name={m.name} size={112} />
        <View style={{ flex: 1, gap: 6, justifyContent: 'flex-end' }}>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {m.gender ? <Pill label={m.gender} color={genderColor(t, m.gender)} /> : null}
            {m.role !== '選手' ? <Pill label={m.role} color={t.mid} /> : null}
          </View>
          <Text variant="title" style={{ fontSize: 26 }}>
            {m.name}
          </Text>
          {m.nameRoman ? (
            <Text variant="caption" tone="tertiary" style={{ letterSpacing: 1 }}>
              {m.nameRoman.toUpperCase()}
            </Text>
          ) : null}
          <Text variant="callout" tone="secondary">
            {memberSubtitle(m)}
          </Text>
        </View>
      </View>

      {m.role === '選手' ? <FollowButton member={m} /> : null}

      {profile.length ? (
        <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
          {profile.map(([k, v], i) => (
            <View key={k}>
              {i > 0 ? <Divider /> : null}
              <View style={styles.kv}>
                <Text variant="callout" tone="secondary" style={{ width: 64 }}>
                  {k}
                </Text>
                <Text variant="callout" style={{ flex: 1 }}>
                  {v}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}

      {m.comment ? (
        <View style={[styles.quote, { borderColor: t.tint }]}>
          <Text variant="body">{m.comment}</Text>
        </View>
      ) : null}

      {m.bests.length ? (
        <View style={{ gap: Spacing.md }}>
          <Text variant="title">自己ベスト（大学）</Text>
          <View style={styles.bests}>
            {m.bests.map(b => (
              <Card key={b.event} style={styles.best}>
                <Text variant="caption" tone="secondary" style={{ fontWeight: '700' }}>
                  {b.event}
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: t.text }} numeric>
                  {b.time}
                </Text>
                <Text variant="caption" tone="tertiary" numberOfLines={1}>
                  {formatDot(b.date)} {b.meet}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      {m.recentResults.length ? (
        <View style={{ gap: Spacing.md }}>
          <Text variant="title">最近の結果</Text>
          <Card padded={false} style={{ paddingHorizontal: Spacing.lg }}>
            {m.recentResults.map((r, i) => (
              <View key={`${r.meet}-${r.date}-${i}`}>
                {i > 0 ? <Divider /> : null}
                <View style={styles.result}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="caption" tone="tertiary" numeric>
                      {formatDot(r.date)}
                    </Text>
                    <Text variant="callout" style={{ fontWeight: '600' }}>
                      {r.meet}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {[r.kukan ? `${r.kukan}区` : r.event, r.rank != null ? `${r.rank}位` : '']
                        .filter(Boolean)
                        .join('　')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text variant="headline" numeric>
                      {r.time}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {r.flags.map(f => (
                        <Pill key={f} label={f} color={t.gold} />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {m.siteUrl ? <SiteLink label="記録の一覧は公式サイトで" url={m.siteUrl} /> : null}
    </>
  );
}

function FollowButton({ member }: { member: Member }) {
  const t = useTheme();
  const { isFollowing, setFollowing, pushAvailable, permission } = usePrefs();
  const on = isFollowing(member.id);
  const toggle = async () => {
    Haptics.selectionAsync().catch(() => {});
    await setFollowing(member.id, !on);
  };
  const note = !pushAvailable
    ? 'このビルドでは通知を受け取れません（設定はこの端末に保存されます）'
    : on && permission === 'denied'
      ? '端末の設定で通知がオフになっています'
      : on
        ? '大会の結果が掲載されたらお知らせします'
        : '結果が掲載されたら通知でお知らせします';
  return (
    <Tap
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={`${member.name}の結果の通知を受け取る`}>
      <View
        style={[styles.follow, { backgroundColor: on ? t.tintSoft : t.surface, borderColor: on ? t.tint : t.border }]}>
        <Icon name={on ? 'bellFill' : 'bell'} size={22} color={t.tint} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="callout" style={{ fontWeight: '700' }}>
            {on ? '結果の通知を受け取っています' : 'この選手の結果の通知を受け取る'}
          </Text>
          <Text variant="caption" tone="secondary">
            {note}
          </Text>
        </View>
        {on ? <Icon name="check" size={18} color={t.tint} /> : null}
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', gap: Spacing.lg },
  kv: { flexDirection: 'row', paddingVertical: Spacing.md, gap: Spacing.md },
  quote: { borderLeftWidth: 3, paddingLeft: Spacing.lg, paddingVertical: Spacing.xs },
  bests: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  best: { flexBasis: '47%', flexGrow: 1, gap: 4, padding: Spacing.md },
  result: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
