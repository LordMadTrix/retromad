import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Game, EmulatorProfile } from '../types';
import { SYSTEMS } from '../data/systems';
import { BUILTIN_EMULATORS } from '../data/emulators';
import { storage } from './storage';

export { BUILTIN_EMULATORS };

export class LauncherService {
  /**
   * Détecte les émulateurs installés sur le système hôte
   */
  async detectInstalledEmulators(): Promise<EmulatorProfile[]> {
    const isWindows = process.platform === 'win32';
    const settings = storage.getSettings();
    const results: EmulatorProfile[] = [];

    for (const emu of BUILTIN_EMULATORS) {
      let isDetected = false;
      let detectedPath: string | undefined = undefined;

      const exe = isWindows ? emu.executableWindows : emu.executableLinux;

      if (!exe) {
        results.push({ ...emu, isDetected: false });
        continue;
      }

      // Cas spécial Flatpak sur Linux
      if (!isWindows && emu.category === 'flatpak') {
        try {
          execSync('flatpak info org.libretro.RetroArch 2>/dev/null');
          isDetected = true;
          detectedPath = 'Flatpak: org.libretro.RetroArch';
        } catch {
          isDetected = false;
        }
      } else if (path.isAbsolute(exe)) {
        // Chemin absolu (ex: /usr/bin/retroarch ou C:\RetroArch...)
        if (fs.existsSync(exe)) {
          isDetected = true;
          detectedPath = exe;
        } else if (emu.id === 'retroarch' && fs.existsSync(settings.retroarchPath)) {
          isDetected = true;
          detectedPath = settings.retroarchPath;
        }
      } else {
        // Binaire standard dans le PATH
        if (!isWindows) {
          try {
            const foundPath = execSync(`which ${exe} 2>/dev/null`, { encoding: 'utf-8' }).trim();
            if (foundPath && fs.existsSync(foundPath)) {
              isDetected = true;
              detectedPath = foundPath;
            }
          } catch {
            isDetected = false;
          }
        }
      }

      results.push({
        ...emu,
        isDetected,
        detectedPath: detectedPath || (isDetected ? exe : undefined)
      });
    }

    return results;
  }

  /**
   * Divise une chaîne de modèle en tableau d'arguments en respectant les guillemets
   */
  parseArgs(commandStr: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const args: string[] = [];
    let match;
    while ((match = regex.exec(commandStr)) !== null) {
      if (match[1] !== undefined) {
        args.push(match[1]);
      } else if (match[2] !== undefined) {
        args.push(match[2]);
      } else {
        args.push(match[0]);
      }
    }
    return args;
  }

  /**
   * Lance un jeu via l'émulateur choisi ou par défaut
   */
  async launchGame(game: Game, preferredEmulatorId?: string): Promise<{ success: boolean; message: string }> {
    const settings = storage.getSettings();
    const system = SYSTEMS.find(s => s.id === game.systemId);

    if (!system) {
      return { success: false, message: `Système inconnu: ${game.systemId}` };
    }

    if (!fs.existsSync(game.path)) {
      return { success: false, message: `Fichier ROM introuvable: ${game.path}` };
    }

    const isWindows = process.platform === 'win32';
    const coreName = isWindows ? system.defaultCoreWindows : system.defaultCoreLinux;
    const corePath = path.join(settings.retroarchCoresDir, coreName);

    // Déterminer quel profil d'émulateur utiliser
    const targetEmulatorId = preferredEmulatorId || (settings.systemLaunchers && settings.systemLaunchers[game.systemId]) || 'retroarch';
    const emuProfile = BUILTIN_EMULATORS.find(e => e.id === targetEmulatorId) || BUILTIN_EMULATORS[0];

    let executable = isWindows ? emuProfile.executableWindows : emuProfile.executableLinux;
    let template = isWindows ? emuProfile.argsTemplateWindows : emuProfile.argsTemplateLinux;

    // Si on utilise RetroArch natif, prioriser le chemin configuré dans les settings
    if (emuProfile.id === 'retroarch' && settings.retroarchPath) {
      executable = settings.retroarchPath;
    }

    // Remplacer les variables dans le template
    const resolvedTemplate = template
      .replace(/\{rom\}/g, game.path)
      .replace(/\{corePath\}/g, fs.existsSync(corePath) ? corePath : coreName)
      .replace(/\{coreName\}/g, coreName)
      .replace(/\{core\}/g, corePath)
    const args = this.parseArgs(resolvedTemplate);

    // Configuration automatique des raccourcis arcade universels (Select+Start = Quitter)
    if (emuProfile.id === 'retroarch') {
      try {
        const hotkeysCfgPath = path.join(storage.mediaDir, 'arcade_hotkeys.cfg');
        const cfgContent = [
          '# Raccourcis Arcade Universels RetroMad (Sortie directe et ergonomie Kiosk)',
          'input_enable_hotkey_btn = "8"',
          'input_exit_emulator_btn = "9"',
          'input_exit_emulator = "escape"',
          'input_menu_toggle_btn = "3"',
          'input_save_state_btn = "5"',
          'input_load_state_btn = "4"',
          'input_rewind_btn = "2"',
          'input_pause_toggle_btn = "0"',
          'quit_press_twice = "false"',
        ].join('\n');
        fs.writeFileSync(hotkeysCfgPath, cfgContent, 'utf-8');

        if (!args.includes('--appendconfig') && fs.existsSync(hotkeysCfgPath)) {
          args.push('--appendconfig', hotkeysCfgPath);
        }
      } catch (e) {
        console.warn('[Launcher] Échec configuration hotkeys arcade :', e);
      }
    }

    try {
      console.log(`[Launcher] Lancement via ${emuProfile.name} : ${executable} ${args.join(' ')}`);


      // Vérification préventive si le chemin est absolu
      if (path.isAbsolute(executable) && !fs.existsSync(executable)) {
        return {
          success: false,
          message: `L'exécutable "${executable}" est introuvable. Installez ${emuProfile.name} ou configurez son chemin dans les paramètres.`
        };
      }

      const startTime = Date.now();

      const child = spawn(executable, args, {
        detached: true,
        stdio: 'ignore'
      });

      const spawnError = await new Promise<Error | null>((resolve) => {
        child.once('spawn', () => resolve(null));
        child.once('error', resolve);
      });

      if (spawnError) {
        console.error(`[Launcher] Échec du démarrage de ${emuProfile.name}:`, spawnError);
        return {
          success: false,
          message: `Impossible de démarrer ${emuProfile.name} : ${spawnError.message}`
        };
      }

      // Ne comptabiliser la session qu'après la création effective du processus.
      game.playCount = (game.playCount || 0) + 1;
      game.lastPlayed = new Date().toISOString();
      const games = storage.getGames();
      const idx = games.findIndex((savedGame) => savedGame.id === game.id);
      if (idx >= 0) {
        games[idx] = game;
        storage.saveGames(games);
      }

      // Suivi précis du temps de jeu effectif lors de la fermeture de l'émulateur
      child.on('exit', () => {
        const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
        console.log(`[Launcher] Fin de session pour "${game.title}" : ${elapsedMinutes} minute(s) de jeu.`);
        try {
          const freshGames = storage.getGames();
          const target = freshGames.find(g => g.id === game.id);
          if (target) {
            target.playTimeMinutes = (target.playTimeMinutes || 0) + elapsedMinutes;
            storage.saveGames(freshGames);
          }
        } catch (e) {
          console.error('[Launcher] Erreur sauvegarde temps de jeu:', e);
        }
      });

      // Écouteur d'erreur pour éviter toute exception non gérée si le binaire échoue au démarrage
      child.on('error', (err) => {
        console.error(`[Launcher] Erreur processus ${emuProfile.name}:`, err);
      });

      child.unref();

      return {
        success: true,
        message: `Lancement de "${game.title}" avec ${emuProfile.name}`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Erreur d'exécution de ${emuProfile.name} : ${err.message}. Vérifiez son installation.`
      };
    }
  }
}

export const launcher = new LauncherService();
