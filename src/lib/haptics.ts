/**
 * Haptic feedback utility for Android/Chrome and iOS Safari 17.4+.
 * Respects prefers-reduced-motion. Silently fails if unsupported.
 */

export type HapticType = 'tap' | 'success' | 'warn' | 'heart' | number;

let switchInputEl: HTMLInputElement | null = null;

function triggerSafariSwitchHaptic(): void {
  try {
    if (typeof document === 'undefined') return;
    if (!switchInputEl) {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.setAttribute('aria-hidden', 'true');

      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
      container.appendChild(label);
      document.body.appendChild(container);

      switchInputEl = input;
    }

    if (switchInputEl) {
      switchInputEl.checked = !switchInputEl.checked;
      switchInputEl.click();
    }
  } catch {
    // Ignore unsupported iOS environments
  }
}

export function haptic(type: HapticType = 'tap'): void {
  if (typeof window === 'undefined') return;

  try {
    // Skip entirely when prefers-reduced-motion is set
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Android / Chrome Navigator.vibrate API
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      if (typeof type === 'number') {
        navigator.vibrate(type);
        return;
      }

      switch (type) {
        case 'tap':
          navigator.vibrate(10);
          break;
        case 'success':
          navigator.vibrate([12, 40, 12]);
          break;
        case 'warn':
          navigator.vibrate([20, 30, 20]);
          break;
        case 'heart':
          navigator.vibrate([8, 30, 14]);
          break;
        default:
          navigator.vibrate(10);
      }
      return;
    }

    // iOS Safari 17.4+ Switch Haptic Fallback
    triggerSafariSwitchHaptic();
  } catch {
    // Silent fail if unsupported
  }
}

export default haptic;
