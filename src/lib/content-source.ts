import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {buildDocumentsFromPublishedContent, type DocumentMap} from './content-registry';

export interface LoadedContent {
  documents: DocumentMap;
  versionId: string;
}

interface RuntimeRpcResponse {
  versionId?: string | null;
  document?: unknown;
}

type RuntimeClientConfig = ReturnType<typeof readConfig>;

let cachedRuntimeClient:
  | {
      config: RuntimeClientConfig;
      client: SupabaseClient;
    }
  | null = null;

function readConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const publishableKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_API_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  const rpcName = (import.meta.env.VITE_SUPABASE_RUNTIME_RPC || 'get_public_slide_runtime').trim();

  if (!url) throw new Error('Falta VITE_SUPABASE_URL.');
  if (!publishableKey) throw new Error('Falta VITE_SUPABASE_PUBLISHABLE_KEY.');
  if (!rpcName) throw new Error('Falta VITE_SUPABASE_RUNTIME_RPC.');

  return {url, publishableKey, rpcName};
}

function getRuntimeClient(config: RuntimeClientConfig) {
  if (
    cachedRuntimeClient &&
    cachedRuntimeClient.config.url === config.url &&
    cachedRuntimeClient.config.publishableKey === config.publishableKey
  ) {
    return cachedRuntimeClient.client;
  }

  const client = createClient(config.url, config.publishableKey, {
    auth: {
      storageKey: 'v2-runtime-public-content',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  cachedRuntimeClient = {
    config,
    client
  };

  return client;
}

export async function loadContent(): Promise<LoadedContent> {
  const config = readConfig();
  const supabase = getRuntimeClient(config);

  const rpcResponse = await supabase.rpc(config.rpcName).single<RuntimeRpcResponse>();

  if (rpcResponse.error) {
    throw new Error(`Supabase RPC ${config.rpcName} falló: ${rpcResponse.error.message}`);
  }

  const versionId = rpcResponse.data?.versionId?.trim();
  if (!versionId) {
    throw new Error(`La RPC ${config.rpcName} no devolvió versionId.`);
  }

  const normalized = buildDocumentsFromPublishedContent(rpcResponse.data?.document);

  return {
    documents: normalized.documents,
    versionId
  };
}
