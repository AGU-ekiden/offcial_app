// ニュース・大会・部員・動画のカード

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { daysUntil, formatDate, formatDateRange, formatDot, memberSubtitle, scheduleDateLabel } from '@/data/format';
import type { Meet, Member, NewsItem, ScheduleItem, Video } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';
import { Avatar, Card, Pill, Tap, Text, genderColor, openExternal } from './ui';

// ── ニュース ──────────────────────────────────────────
export function openNews(n: NewsItem) {
  if (n.meetId) router.push({ pathname: '/meet/[id]', params: { id: n.meetId } });
  else if (n.scheduleId) router.push({ pathname: '/schedule/[id]', params: { id: n.scheduleId } });
  else if (n.url) openExternal(n.url);
}

export function newsHasLink(n: NewsItem) {
  return !!(n.meetId || n.scheduleId || n.url);
}

export function NewsRow({ item }: { item: NewsItem }) {
  const t = useTheme();
  const tagColor = item.tag === '結果' ? t.gold : item.tag === '予定' ? t.mid : t.textSecondary;
  const linked = newsHasLink(item);
  const body = (
    <View style={styles.newsRow}>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.inline}>
          <Text variant="caption" tone="tertiary" numeric>
            {formatDot(item.date)}
          </Text>
          {item.tag ? <Pill label={item.tag} color={tagColor} /> : null}
        </View>
        <Text variant="callout" style={{ fontWeight: '600' }}>
          {item.title}
        </Text>
      </View>
      {linked ? (
        <Icon
          name={item.url && !item.meetId && !item.scheduleId ? 'external' : 'chevron'}
          size={14}
          color={t.textTertiary}
        />
      ) : null}
    </View>
  );
  return linked ? (
    <Tap onPress={() => openNews(item)} accessibilityLabel={`${item.tag} ${item.title}`}>
      {body}
    </Tap>
  ) : (
    body
  );
}

// ── 次の大会（ホームの大きなカード） ──────────────────
export function NextRaceHero({ item }: { item: ScheduleItem }) {
  const days = daysUntil(item.date);
  const ongoing = days <= 0 && daysUntil(item.dateEnd) >= 0;
  return (
    <Tap
      onPress={() => router.push({ pathname: '/schedule/[id]', params: { id: item.id } })}
      accessibilityLabel={`次の大会 ${item.name} ${scheduleDateLabel(item)}`}>
      <LinearGradient colors={['#00403E', '#007B78']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroStripe} />
        <Text variant="overline" style={{ color: '#9FE3DD' }}>
          NEXT RACE
        </Text>
        <Text variant="title" style={{ color: '#fff', fontSize: 23, lineHeight: 30 }}>
          {item.name}
        </Text>
        <View style={styles.heroBottom}>
          <View style={{ gap: 4, flex: 1 }}>
            <View style={styles.inline}>
              <Icon name="calendar" size={14} color="#CDEFEC" />
              <Text variant="callout" style={{ color: '#E5F7F5' }}>
                {scheduleDateLabel(item)}
              </Text>
            </View>
            {item.venue ? (
              <View style={styles.inline}>
                <Icon name="location" size={14} color="#CDEFEC" />
                <Text variant="callout" style={{ color: '#E5F7F5' }}>
                  {item.venue}
                </Text>
              </View>
            ) : null}
          </View>
          {!item.undetermined ? (
            <View style={styles.countdown}>
              {ongoing ? (
                <Text variant="headline" style={{ color: '#fff' }}>
                  開催中
                </Text>
              ) : days === 0 ? (
                <Text variant="headline" style={{ color: '#fff' }}>
                  きょう
                </Text>
              ) : (
                <>
                  <Text variant="caption" style={{ color: '#CDEFEC' }}>
                    あと
                  </Text>
                  <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800', lineHeight: 44 }} numeric>
                    {days}
                  </Text>
                  <Text variant="callout" style={{ color: '#CDEFEC' }}>
                    日
                  </Text>
                </>
              )}
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Tap>
  );
}

// ── 大会予定 ──────────────────────────────────────────
export function ScheduleRow({ item }: { item: ScheduleItem }) {
  const t = useTheme();
  const days = daysUntil(item.date);
  const [, m, d] = item.date.split('-').map(Number);
  return (
    <Tap onPress={() => router.push({ pathname: '/schedule/[id]', params: { id: item.id } })}>
      <View style={styles.scheduleRow}>
        <View style={[styles.dateBox, { backgroundColor: t.tintSoft }]}>
          {item.undetermined ? (
            <Text variant="caption" tone="tint" style={{ fontWeight: '700' }}>
              {m}月頃
            </Text>
          ) : (
            <>
              <Text variant="caption" tone="tint" style={{ fontWeight: '700' }}>
                {m}月
              </Text>
              <Text tone="tint" style={{ fontSize: 22, fontWeight: '800', lineHeight: 26 }} numeric>
                {d}
              </Text>
            </>
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="callout" style={{ fontWeight: '700' }}>
            {item.name}
          </Text>
          <Text variant="caption" tone="secondary">
            {[scheduleDateLabel(item), item.venue].filter(Boolean).join('　')}
          </Text>
          <View style={styles.inline}>
            {item.category ? <Pill label={item.category} color={t.mid} /> : null}
            {item.target && item.target !== '両方' ? (
              <Pill label={item.target} color={genderColor(t, item.target)} />
            ) : null}
            {!item.undetermined && days > 0 && days <= 30 ? (
              <Text variant="caption" tone="tint" style={{ fontWeight: '700' }}>
                あと{days}日
              </Text>
            ) : null}
          </View>
        </View>
        <Icon name="chevron" size={14} color={t.textTertiary} />
      </View>
    </Tap>
  );
}

// ── 大会結果 ──────────────────────────────────────────
export function meetSummary(meet: Meet) {
  const team = meet.races.flatMap(r => r.teamResults.filter(tr => tr.part === '総合').map(tr => ({ r, tr })));
  if (team.length) {
    return team
      .map(({ r, tr }) =>
        [r.label || (meet.races.length > 1 ? r.gender : ''), '総合', tr.rank != null ? `${tr.rank}位` : '', tr.time]
          .filter(Boolean)
          .join(' '),
      )
      .join(' / ');
  }
  const people = new Set(meet.races.flatMap(r => r.rows.flatMap(row => row.athletes.map(a => a.name))));
  return people.size ? `${meet.races.length}レース・${people.size}人が出場` : '';
}

export function MeetCard({ meet, style }: { meet: Meet; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const highlights = meet.races.flatMap(r => r.rows).filter(r => r.flags.length).length;
  return (
    <Tap onPress={() => router.push({ pathname: '/meet/[id]', params: { id: meet.id } })} style={style}>
      <Card>
        <View style={{ gap: 6 }}>
          <View style={styles.inline}>
            <Text variant="caption" tone="tertiary">
              {formatDateRange(meet.date, meet.dateEnd)}
            </Text>
            {meet.category ? <Pill label={meet.category} color={t.mid} /> : null}
          </View>
          <Text variant="headline">{meet.name}</Text>
          {meetSummary(meet) ? (
            <Text variant="callout" tone="secondary">
              {meetSummary(meet)}
            </Text>
          ) : null}
          {highlights ? (
            <View style={styles.inline}>
              <Icon name="trophy" size={14} color={t.gold} />
              <Text variant="caption" style={{ color: t.gold, fontWeight: '700' }}>
                自己ベスト・区間賞など {highlights}件
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Tap>
  );
}

// ── 部員 ──────────────────────────────────────────────
export function MemberTile({ member, width }: { member: Member; width: number }) {
  const t = useTheme();
  return (
    <Tap
      onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })}
      style={{ width }}
      accessibilityLabel={`${member.name} ${memberSubtitle(member)}`}>
      <View style={{ gap: 6 }}>
        <Avatar uri={member.photo} name={member.name} size={width} />
        <View style={{ gap: 1 }}>
          <Text variant="callout" style={{ fontWeight: '700' }} numberOfLines={1}>
            {member.name}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {memberSubtitle(member) || member.role}
          </Text>
          {member.faculty ? (
            <Text variant="caption" tone="tertiary" numberOfLines={1} style={{ color: t.textTertiary }}>
              {member.faculty}
            </Text>
          ) : null}
        </View>
      </View>
    </Tap>
  );
}

// ── 限定動画 ──────────────────────────────────────────
export function VideoCard({ video, width, style }: { video: Video; width?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <Tap
      onPress={() => router.push({ pathname: '/video/[id]', params: { id: video.id } })}
      style={[width ? { width } : null, style]}
      accessibilityLabel={`動画 ${video.title}`}>
      <View style={{ gap: Spacing.sm }}>
        <View style={[styles.thumb, { backgroundColor: t.deep }]}>
          {video.thumbnail ? (
            <Image
              source={{ uri: video.thumbnail }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={['#00403E', '#00A59F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.playBadge}>
            <Icon name="play" size={16} color="#fff" />
          </View>
          {video.category ? (
            <View style={styles.thumbTag}>
              <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
                {video.category}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ gap: 2 }}>
          <Text variant="callout" style={{ fontWeight: '700' }} numberOfLines={2}>
            {video.title}
          </Text>
          <Text variant="caption" tone="tertiary">
            {formatDate(video.date, { year: true })}
          </Text>
        </View>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  newsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  hero: { borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.sm, overflow: 'hidden', minHeight: 200 },
  heroStripe: {
    position: 'absolute',
    right: -40,
    top: -30,
    width: 180,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '24deg' }],
  },
  heroBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, marginTop: 'auto' },
  countdown: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: -6 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  dateBox: { width: 56, height: 60, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  thumb: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbTag: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
