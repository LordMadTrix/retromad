/// <reference types="vite/client" />

import { API } from '../electron/preload';

declare global {
  interface Window {
    api: typeof API;
    isElectron?: boolean;
    webkitAudioContext?: typeof AudioContext;
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
    __retromad_ejs_loaded?: boolean;
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameUrl?: string;
    EJS_gameName?: string;
    EJS_pathtodata?: string;
    EJS_startOnLoaded?: boolean;
    EJS_language?: string;
    EJS_volume?: number;
    EJS_Buttons?: Record<string, boolean>;
    EJS_defaultOptions?: Record<string, string>;
    EJS_fullscreen?: boolean;
    EJS_emulator?: {
      callEvent?: (event: string) => void;
    };
  }
}
