/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  // 在这里添加其他 VITE_ 变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
