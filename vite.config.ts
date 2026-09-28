import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

/**
 * Génère public/roms/_index.json : liste des vraies ROMs présentes sur le disque
 * (dev ET build) pour que le scan web puisse les référencer.
 */
const ROM_EXTENSIONS = new Set([
  '.nes', '.fds', '.unf', '.sfc', '.smc', '.fig', '.gb', '.gbc', '.gba', '.n64', '.z64', '.v64',
  '.md', '.gen', '.sms', '.gg', '.32x', '.bin', '.cue', '.iso', '.chd', '.pbp',
  '.zip', '.7z', '.a26', '.a78', '.lnx', '.j64', '.col', '.int', '.vec', '.ws', '.wsc',
  '.ngp', '.ngc', '.pce', '.d88', '.dsk', '.tap', '.tzx', '.prg', '.d64', '.adf', '.rom',
]);

function walkRoms(dir: string, baseDir: string, out: Array<{ path: string; filename: string; size: number }>): void {
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) walkRoms(full, baseDir, out);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (ROM_EXTENSIONS.has(ext)) {
        let size = 0;
        try {
          size = fs.statSync(full).size;
        } catch {
          /* ignore */
        }
        out.push({
          path: '/' + path.relative(baseDir, full).replace(/\\/g, '/'),
          filename: entry.name,
          size,
        });
      }
    }
  }
}

function romIndexPlugin(): Plugin {
  const generate = () => {
    const romsDir = path.resolve(__dirname, 'public/roms');
    if (!fs.existsSync(romsDir)) return;
    const files: Array<{ path: string; filename: string; size: number }> = [];
    walkRoms(romsDir, romsDir, files);
    fs.writeFileSync(path.join(romsDir, '_index.json'), JSON.stringify({ generated: new Date().toISOString(), count: files.length, files }, null, 0));
  };
  return {
    name: 'retromad-rom-index',
    configureServer() {
      generate();
    },
    buildStart() {
      generate();
    },
  };
}

/** Hash court du commit git courant ('' si indisponible, hors dépôt). */
function getGitHash(): string {
  try {
    return require('child_process').execSync('git rev-parse --short HEAD', {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch {
    return '';
  }
}

export default defineConfig({
  plugins: [react(), romIndexPlugin()],
// Chemins relatifs : indispensables pour le mode bureau Electron (file://).
// Avec '/', le build référence /assets/... qui ne se résout pas en file:// → écran noir.
  base: './',
  // Indicateur de version : hash court du commit + date, lus au lancement du
  // build. Permet de repérer immédiatement une instance sur un ancien bundle.
  define: {
    'import.meta.env.VITE_APP_BUILD_HASH': JSON.stringify(getGitHash()),
    'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
