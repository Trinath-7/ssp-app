import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: { url: string; key: string } | null = null;

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const targetUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const targetKey = key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!targetUrl || !targetKey) {
    return null;
  }

  // If specific credentials were provided and differ from cache, create new client
  if (url && key) {
    if (lastUsedConfig?.url === url && lastUsedConfig?.key === key && cachedClient) {
      return cachedClient;
    }
    const client = createClient(targetUrl, targetKey, {
      auth: { persistSession: false },
    });
    return client;
  }

  if (!cachedClient) {
    cachedClient = createClient(targetUrl, targetKey, {
      auth: { persistSession: false },
    });
    lastUsedConfig = { url: targetUrl, key: targetKey };
  }

  return cachedClient;
};

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && url.startsWith('http'));
};

export const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;

