// アプリ用データの読み込み。
// - 前回読み込んだデータを端末に保存しておき、起動直後やオフラインでもすぐ表示する
// - アプリを開くたび（前回から5分以上たっていれば）裏で新しいデータを取りに行く

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { sampleData } from './sample';
import { SCHEMA_VERSION, type AppData } from './types';

export const DATA_URL = process.env.EXPO_PUBLIC_DATA_URL || 'https://aogaku-tf.com/app/v1/data.json';
const USE_SAMPLE = process.env.EXPO_PUBLIC_USE_SAMPLE_DATA === '1';
const CACHE_KEY = 'appdata:v1';
const STALE_MS = 5 * 60 * 1000;

type Status = 'loading' | 'ready' | 'error';

type DataState = {
  data: AppData | null;
  status: Status;
  /** 最後の取得に失敗したときの説明（古いデータは表示したまま） */
  error: string | null;
  refreshing: boolean;
  isSample: boolean;
  refresh: () => Promise<void>;
};

const DataContext = createContext<DataState | null>(null);

class OutdatedAppError extends Error {}

function isAppData(value: unknown): value is AppData {
  const v = value as AppData | null;
  return !!v && typeof v === 'object' && Array.isArray(v.news) && Array.isArray(v.members) && Array.isArray(v.meets);
}

async function fetchData(): Promise<AppData> {
  if (USE_SAMPLE) return sampleData();
  const res = await fetch(`${DATA_URL}?t=${Math.floor(Date.now() / 60000)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: unknown = await res.json();
  if (!isAppData(json)) throw new Error('データの形が正しくありません');
  if (json.schemaVersion > SCHEMA_VERSION) throw new OutdatedAppError();
  return json;
}

function describe(e: unknown) {
  if (e instanceof OutdatedAppError) return '新しいバージョンのアプリが必要です。ストアからアップデートしてください。';
  return '最新の情報を読み込めませんでした。通信状態を確認して、もう一度お試しください。';
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const lastFetched = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    const run = (async () => {
      try {
        const next = await fetchData();
        lastFetched.current = Date.now();
        setData(next);
        setStatus('ready');
        setError(null);
        if (!USE_SAMPLE) AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
      } catch (e) {
        setError(describe(e));
        setStatus(s => (s === 'ready' ? 'ready' : 'error'));
      }
    })();
    inFlight.current = run;
    try {
      await run;
    } finally {
      inFlight.current = null;
    }
  }, []);

  // 起動時：保存しておいたデータを先に出してから、新しいデータを取りに行く
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!USE_SAMPLE) {
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          const parsed: unknown = cached ? JSON.parse(cached) : null;
          if (!cancelled && isAppData(parsed) && parsed.schemaVersion <= SCHEMA_VERSION) {
            setData(parsed);
            setStatus('ready');
          }
        } catch {
          // 保存データが壊れていても、取り直せばよい
        }
      }
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  // アプリに戻ってきたとき、古ければ取り直す
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && Date.now() - lastFetched.current > STALE_MS) load();
    });
    return () => sub.remove();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const value = useMemo(
    () => ({ data, status, error, refreshing, isSample: USE_SAMPLE, refresh }),
    [data, status, error, refreshing, refresh],
  );
  return <DataContext value={value}>{children}</DataContext>;
}

export function useAppData() {
  const ctx = use(DataContext);
  if (!ctx) throw new Error('useAppData must be used inside DataProvider');
  return ctx;
}
