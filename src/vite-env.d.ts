/// <reference types="vite/client" />
declare module '*.css';

interface ImportMetaEnv {
  readonly VITE_CONTENT_RUNTIME_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
