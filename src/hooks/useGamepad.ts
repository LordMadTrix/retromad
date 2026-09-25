import { useEffect, useRef, useState } from 'react';

export type GamepadBrand = 'xbox' | 'playstation' | 'nintendo' | 'generic';

export interface GamepadInfo {
  connected: boolean;
  brand: GamepadBrand;
  id: string;
  name: string;
}

export function detectGamepadBrand(id: string): GamepadBrand {
  const lower = (id || '').toLowerCase();
  if (
    lower.includes('playstation') ||
    lower.includes('dualshock') ||
    lower.includes('dualsense') ||
    lower.includes('sony') ||
    lower.includes('054c')
  ) {
    return 'playstation';
  }
  if (
    lower.includes('nintendo') ||
    lower.includes('switch') ||
    lower.includes('joy-con') ||
    lower.includes('pro controller') ||
    lower.includes('057e')
  ) {
    return 'nintendo';
  }
  if (
    lower.includes('xbox') ||
    lower.includes('xinput') ||
    lower.includes('microsoft') ||
    lower.includes('045e')
  ) {
    return 'xbox';
  }
  return 'xbox';
}

export function useGamepadStatus(): GamepadInfo {
  const [info, setInfo] = useState<GamepadInfo>(() => {
    const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(gamepads).find((g) => g && g.connected);
    if (gp) {
      return {
        connected: true,
        brand: detectGamepadBrand(gp.id),
        id: gp.id,
        name: gp.id.replace(/\(.*\)/, '').trim(),
      };
    }
    return {
      connected: false,
      brand: 'xbox',
      id: '',
      name: '',
    };
  });

  useEffect(() => {
    const handleConnected = (e: GamepadEvent) => {
      if (e.gamepad) {
        setInfo({
          connected: true,
          brand: detectGamepadBrand(e.gamepad.id),
          id: e.gamepad.id,
          name: e.gamepad.id.replace(/\(.*\)/, '').trim(),
        });
      }
    };

    const handleDisconnected = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const remaining = Array.from(gamepads).find((g) => g && g.connected);
      if (remaining) {
        setInfo({
          connected: true,
          brand: detectGamepadBrand(remaining.id),
          id: remaining.id,
          name: remaining.id.replace(/\(.*\)/, '').trim(),
        });
      } else {
        setInfo({
          connected: false,
          brand: 'xbox',
          id: '',
          name: '',
        });
      }
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    const interval = setInterval(() => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = Array.from(gamepads).find((g) => g && g.connected);
      if (gp) {
        const detected = detectGamepadBrand(gp.id);
        const name = gp.id.replace(/\(.*\)/, '').trim();
        setInfo((prev) => {
          if (!prev.connected || prev.id !== gp.id || prev.brand !== detected) {
            return { connected: true, brand: detected, id: gp.id, name };
          }
          return prev;
        });
      } else {
        setInfo((prev) => (prev.connected ? { connected: false, brand: 'xbox', id: '', name: '' } : prev));
      }
    }, 1500);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
      clearInterval(interval);
    };
  }, []);

  return info;
}

interface GamepadHandlers {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onConfirm?: () => void; // A (Xbox) / X (PlayStation) / B (Nintendo)
  onCancel?: () => void;  // B (Xbox) / O (PlayStation) / A (Nintendo)
  onDetails?: () => void; // X (Xbox) / Carré (PlayStation) / Y (Nintendo)
  onFavorite?: () => void;// Y (Xbox) / Triangle (PlayStation) / X (Nintendo)
  onPrevTab?: () => void; // LB / L1 / L
  onNextTab?: () => void; // RB / R1 / R
  onMenu?: () => void;    // Start / Options
  onRandom?: () => void;  // R3 / Select
}

export function useGamepad(handlers: GamepadHandlers, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const lastTimeRef = useRef<Record<string, number>>({});
  const lastStateRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) return;

    let animFrameId: number;
    let frameCount = 0;

    const checkGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads.find((g) => g && g.connected);

      if (gp) {
        const now = Date.now();
        const DEBOUNCE_FIRST = 280; // Délai avant répétition
        const DEBOUNCE_REPEAT = 150; // Délai entre répétitions

        const trigger = (action: keyof GamepadHandlers, isPressed: boolean) => {
          const wasPressed = !!lastStateRef.current[action];
          const lastTime = lastTimeRef.current[action] || 0;

          if (isPressed) {
            if (!wasPressed) {
              // Premier appui instantané
              handlersRef.current[action]?.();
              lastTimeRef.current[action] = now + DEBOUNCE_FIRST;
            } else if (now > lastTime) {
              // Répétition automatique
              handlersRef.current[action]?.();
              lastTimeRef.current[action] = now + DEBOUNCE_REPEAT;
            }
          }

          lastStateRef.current[action] = isPressed;
        };

        // D-Pad
        const dpadUp = gp.buttons[12]?.pressed || gp.axes[1] < -0.5;
        const dpadDown = gp.buttons[13]?.pressed || gp.axes[1] > 0.5;
        const dpadLeft = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
        const dpadRight = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;

        trigger('onUp', dpadUp);
        trigger('onDown', dpadDown);
        trigger('onLeft', dpadLeft);
        trigger('onRight', dpadRight);

        // Boutons d'action
        trigger('onConfirm', !!gp.buttons[0]?.pressed); // A / Croix
        trigger('onCancel', !!gp.buttons[1]?.pressed);  // B / Rond
        trigger('onDetails', !!gp.buttons[2]?.pressed); // X / Carré
        trigger('onFavorite', !!gp.buttons[3]?.pressed);// Y / Triangle

        // Gâchettes d'onglets
        trigger('onPrevTab', !!gp.buttons[4]?.pressed); // LB / L1
        trigger('onNextTab', !!gp.buttons[5]?.pressed); // RB / R1

        // Menu / Start
        trigger('onMenu', !!gp.buttons[9]?.pressed);

        // Select / R3 pour jeu au hasard
        trigger('onRandom', !!(gp.buttons[8]?.pressed || gp.buttons[11]?.pressed));
      }

      // Polling à ~30 Hz (une frame sur deux) : amplement suffisant vu les
      // délais anti-rebond (150-280 ms), et divise le coût CPU par 2.
      frameCount++;
      if (frameCount % 2 === 0) {
        animFrameId = requestAnimationFrame(checkGamepad);
        return;
      }

      animFrameId = requestAnimationFrame(checkGamepad);
    };

    animFrameId = requestAnimationFrame(checkGamepad);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [enabled]);
}
