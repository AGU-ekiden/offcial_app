// 通知の設定とフォロー（端末の中だけに保存。ログイン・アカウントは使わない）。
// 「フォロー」は、その選手の結果の通知を受け取ることだけを意味する（数は数えない・どこにも表示しない）。

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useAppData } from '@/data/store';

import * as push from './firebase';

export type TopicKey = 'news' | 'results' | 'videos';

type Prefs = {
  /** 「通知を受け取る」を一度でも選んだか（選ぶまでは何も購読しない） */
  enabled: boolean;
  topics: Record<TopicKey, boolean>;
  follows: string[];
};

const PREFS_KEY = 'prefs:v1';
const SUBSCRIBED_KEY = 'subscribed:v1';
const DEFAULT_PREFS: Prefs = { enabled: false, topics: { news: true, results: true, videos: true }, follows: [] };

type PrefsState = {
  prefs: Prefs;
  loaded: boolean;
  permission: push.PermissionState;
  pushAvailable: boolean;
  /** 通知の許可を求めて有効にする */
  enableNotifications: () => Promise<push.PermissionState>;
  setTopic: (key: TopicKey, on: boolean) => void;
  isFollowing: (memberId: string) => boolean;
  setFollowing: (memberId: string, on: boolean) => Promise<void>;
};

const PrefsContext = createContext<PrefsState | null>(null);

export const memberTopic = (id: string) => `member-${id}`;

function desiredTopics(prefs: Prefs, permission: push.PermissionState) {
  if (!prefs.enabled || permission !== 'granted') return new Set<string>();
  const keys = (Object.keys(prefs.topics) as TopicKey[]).filter(k => prefs.topics[k]);
  return new Set<string>([...keys, ...prefs.follows.map(memberTopic)]);
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const { data, isSample } = useAppData();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<push.PermissionState>('undetermined');
  const syncing = useRef(false);
  const pushAvailable = push.isPushAvailable();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Prefs>;
          setPrefs({ ...DEFAULT_PREFS, ...saved, topics: { ...DEFAULT_PREFS.topics, ...saved.topics } });
        }
      } catch {
        // 壊れていたら初期設定に戻す
      }
      setLoaded(true);
      setPermission(await push.getPermission());
    })();
  }, []);

  // 設定アプリで通知を切り替えて戻ってきた場合に追従する
  useEffect(() => {
    const sub = AppState.addEventListener('change', async s => {
      if (s === 'active') setPermission(await push.getPermission());
    });
    return () => sub.remove();
  }, []);

  const update = useCallback((fn: (p: Prefs) => Prefs) => {
    setPrefs(prev => {
      const next = fn(prev);
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // 名簿からいなくなった選手（卒業など）は、フォローしていないものとして扱う
  const follows = useMemo(() => {
    if (isSample || !data?.members.length) return prefs.follows;
    const ids = new Set(data.members.map(m => m.id));
    return prefs.follows.filter(id => ids.has(id));
  }, [isSample, data, prefs.follows]);
  const effective = useMemo(() => ({ ...prefs, follows }), [prefs, follows]);

  // 購読しているトピックを設定に合わせる（失敗したものは次の機会にやり直す）
  const latestWant = useRef<Set<string>>(new Set());
  const dirty = useRef(false);
  const syncTopics = useCallback(async () => {
    if (syncing.current) {
      dirty.current = true;
      return;
    }
    syncing.current = true;
    try {
      do {
        dirty.current = false;
        const want = latestWant.current;
        const have = new Set<string>(JSON.parse((await AsyncStorage.getItem(SUBSCRIBED_KEY)) ?? '[]'));
        for (const t of want) {
          if (have.has(t)) continue;
          try {
            await push.subscribe(t);
            have.add(t);
          } catch {}
        }
        for (const t of [...have]) {
          if (want.has(t)) continue;
          try {
            await push.unsubscribe(t);
            have.delete(t);
          } catch {}
        }
        await AsyncStorage.setItem(SUBSCRIBED_KEY, JSON.stringify([...have]));
      } while (dirty.current);
    } catch {
      // 次に設定が変わったときにやり直す
    } finally {
      syncing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!loaded || !pushAvailable) return;
    latestWant.current = desiredTopics(effective, permission);
    syncTopics();
  }, [loaded, pushAvailable, effective, permission, syncTopics]);

  const enableNotifications = useCallback(async () => {
    const result = await push.requestPermission();
    setPermission(result);
    if (result === 'granted') update(p => ({ ...p, enabled: true }));
    return result;
  }, [update]);

  const setTopic = useCallback(
    (key: TopicKey, on: boolean) => update(p => ({ ...p, topics: { ...p.topics, [key]: on } })),
    [update],
  );

  const followSet = useMemo(() => new Set(follows), [follows]);
  const isFollowing = useCallback((id: string) => followSet.has(id), [followSet]);

  const setFollowing = useCallback(
    async (id: string, on: boolean) => {
      if (on && pushAvailable && (!prefs.enabled || permission !== 'granted')) {
        // フォローは通知を受け取るためのものなので、まだなら許可を求める
        await enableNotifications();
      }
      update(p => ({
        ...p,
        follows: on ? [...new Set([...p.follows, id])] : p.follows.filter(x => x !== id),
      }));
    },
    [pushAvailable, prefs.enabled, permission, enableNotifications, update],
  );

  const value = useMemo(
    () => ({
      prefs: effective,
      loaded,
      permission,
      pushAvailable,
      enableNotifications,
      setTopic,
      isFollowing,
      setFollowing,
    }),
    [effective, loaded, permission, pushAvailable, enableNotifications, setTopic, isFollowing, setFollowing],
  );
  return <PrefsContext value={value}>{children}</PrefsContext>;
}

export function usePrefs() {
  const ctx = use(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
}
