/// <reference types="vite/client" />

import { API } from '../electron/preload';

declare global {
  interface Window {
    api: typeof API;
  }
}
