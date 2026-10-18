import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { VideoCard } from '@/components/cards';
import { DataGate, EmptyState, Screen, Tap, Text } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

export default function VideosScreen() {
  return (
    <Screen eyebrow="APP ONLY" title="限定動画">
      <DataGate>
        <VideosContent />
      </DataGate>
    </Screen>
  );
}

function VideosContent() {
  const t = useTheme();
  const { data } = useAppData();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<string | null>(null);
  if (!data) return null;

  const categories = [...new Set(data.videos.map(v => v.category).filter(Boolean))];
  const videos = data.videos.filter(v => !category || v.category === category);
  const contentWidth = Math.min(width, MaxContentWidth) - Spacing.lg * 2;
  const columns = contentWidth > 520 ? 2 : 1;
  const tileWidth = Math.floor((contentWidth - Spacing.lg * (columns - 1)) / columns);

  return (
    <>
      <Text variant="callout" tone="secondary">
        学内タイムトライアルや練習・合宿・寮生活など、チームの日常をアプリだけでお届けします。
      </Text>
      {categories.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
          {[null, ...categories].map(c => {
            const active = c === category;
            return (
              <Tap key={c ?? 'all'} onPress={() => setCategory(c)} accessibilityState={{ selected: active }}>
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: Radius.pill,
                    backgroundColor: active ? t.tint : t.surfaceMuted,
                  }}>
                  <Text variant="callout" style={{ fontWeight: '600', color: active ? t.onTint : t.textSecondary }}>
                    {c ?? 'すべて'}
                  </Text>
                </View>
              </Tap>
            );
          })}
        </ScrollView>
      ) : null}
      {videos.length === 0 ? (
        <EmptyState icon="video" title="動画は準備中です" message="公開されたら通知でお知らせします。" />
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg }}>
        {videos.map(v => (
          <VideoCard key={v.id} video={v} width={tileWidth} />
        ))}
      </View>
    </>
  );
}
