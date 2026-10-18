import { Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { VideoCard } from '@/components/cards';
import { Button, DataGate, EmptyState, Pill, Screen, Text, openExternal } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/data/format';
import { useAppData } from '@/data/store';
import type { Video } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';

const isDirectVideo = (url: string) => /\.(mp4|m4v|mov|m3u8)(\?|$)/i.test(url);

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const video = data?.videos.find(v => v.id === id);
  const others = data?.videos.filter(v => v.id !== id).slice(0, 4) ?? [];
  return (
    <>
      <Stack.Screen options={{ title: '限定動画' }} />
      <Screen refreshable={false}>
        <DataGate>
          {video ? (
            <VideoDetail video={video} others={others} />
          ) : (
            <EmptyState icon="video" title="動画が見つかりません" />
          )}
        </DataGate>
      </Screen>
    </>
  );
}

function VideoDetail({ video, others }: { video: Video; others: Video[] }) {
  const t = useTheme();
  return (
    <>
      <View style={[styles.player, { backgroundColor: '#000' }]}>
        {video.youtubeId ? (
          <YouTubePlayer id={video.youtubeId} />
        ) : isDirectVideo(video.url) ? (
          <FilePlayer url={video.url} />
        ) : (
          <View style={styles.center}>
            <Text variant="callout" style={{ color: '#fff' }}>
              {video.url ? 'この動画はブラウザで再生します' : '動画は準備中です'}
            </Text>
          </View>
        )}
      </View>
      <View style={{ gap: Spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {video.category ? <Pill label={video.category} color={t.mid} /> : null}
          <Text variant="caption" tone="tertiary">
            {formatDate(video.date, { year: true })}
          </Text>
        </View>
        <Text variant="title">{video.title}</Text>
        {video.description ? <Text variant="body">{video.description}</Text> : null}
      </View>
      {video.url && !video.youtubeId && !isDirectVideo(video.url) ? (
        <Button label="動画を開く" icon="external" onPress={() => openExternal(video.url)} />
      ) : null}
      {others.length ? (
        <View style={{ gap: Spacing.md }}>
          <Text variant="title">ほかの動画</Text>
          {others.map(v => (
            <VideoCard key={v.id} video={v} />
          ))}
        </View>
      ) : null}
    </>
  );
}

function YouTubePlayer({ id }: { id: string }) {
  // 関連動画は同じチャンネルのものだけにし、Cookie を使わない埋め込みにする
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?playsinline=1&rel=0&modestbranding=1`;
  if (Platform.OS === 'web') {
    return (
      <iframe
        src={src}
        style={{ border: 0, width: '100%', height: '100%' }}
        allow="fullscreen; picture-in-picture"
        title="動画"
      />
    );
  }
  return (
    <WebView
      source={{ uri: src }}
      style={StyleSheet.absoluteFill}
      allowsInlineMediaPlayback
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      // 埋め込みの外（YouTube のページなど）へはアプリ内で移動させず、ブラウザで開く
      onShouldStartLoadWithRequest={req => {
        if (req.url.startsWith('https://www.youtube-nocookie.com/embed/') || req.url === 'about:blank') return true;
        openExternal(req.url);
        return false;
      }}
    />
  );
}

function FilePlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls />;
}

const styles = StyleSheet.create({
  player: { aspectRatio: 16 / 9, borderRadius: Radius.md, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
