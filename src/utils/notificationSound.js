// src/utils/notificationSound.js
// Dual-engine notification sound player:
// 1. High-fidelity Web Audio API synth (warm, hospital-grade dual-tone chime: D5 587Hz -> A5 880Hz + harmonics)
// 2. Embedded HTML5 Audio fallback for maximum cross-browser reliability
// 3. AudioContext automatic unlock on user interaction

let globalAudioContext = null;

function getOrCreateAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!globalAudioContext) {
    try {
      globalAudioContext = new AudioContextClass();
    } catch (err) {
      console.warn('[NotificationSound] Could not create AudioContext:', err);
    }
  }
  return globalAudioContext;
}

/**
 * Checks whether notification sound is enabled in user settings (localStorage)
 */
export function isNotificationSoundEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem('zestmed_notification_settings');
    if (!stored) return true;
    const parsed = JSON.parse(stored);
    return parsed.sound !== false;
  } catch {
    return true;
  }
}

/**
 * Plays a pleasant, clearly audible dual-tone notification chime
 * @param {boolean} force - If true, bypasses user settings check (e.g., when testing or enabling sound)
 */
export function playNotificationSound(force = false) {
  if (typeof window === 'undefined') return false;
  if (!force && !isNotificationSoundEnabled()) return false;

  let played = false;

  // 1. Web Audio API Synthesis
  try {
    const ctx = getOrCreateAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      
      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.45, now);
      masterGain.connect(ctx.destination);

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.55, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.32);

      // Note 1 Harmonic: D6 (1174.66 Hz)
      const osc1h = ctx.createOscillator();
      const gain1h = ctx.createGain();
      osc1h.type = 'triangle';
      osc1h.frequency.setValueAtTime(1174.66, now);
      gain1h.gain.setValueAtTime(0.2, now);
      gain1h.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1h.connect(gain1h);
      gain1h.connect(masterGain);
      osc1h.start(now);
      osc1h.stop(now + 0.22);

      // Note 2: A5 (880.00 Hz) at now + 0.11s
      const t2 = now + 0.11;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, t2);
      gain2.gain.setValueAtTime(0.65, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.45);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(t2);
      osc2.stop(t2 + 0.45);

      // Note 2 Harmonic: A6 (1760.00 Hz)
      const osc2h = ctx.createOscillator();
      const gain2h = ctx.createGain();
      osc2h.type = 'triangle';
      osc2h.frequency.setValueAtTime(1760.00, t2);
      gain2h.gain.setValueAtTime(0.25, t2);
      gain2h.gain.exponentialRampToValueAtTime(0.001, t2 + 0.35);
      osc2h.connect(gain2h);
      gain2h.connect(masterGain);
      osc2h.start(t2);
      osc2h.stop(t2 + 0.35);

      played = true;
    }
  } catch (err) {
    console.warn('[NotificationSound] Web Audio API playback error:', err);
  }

  // 2. HTML5 Audio Fallback
  try {
    const audio = new Audio('/notification-chime.wav');
    audio.volume = 0.65;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          played = true;
        })
        .catch(() => {
          // Autoplay was prevented or file not ready
        });
    }
  } catch (_) {}

  return played;
}

/**
 * Dispatches a global event to trigger notification sound across the app
 */
export function triggerNotificationSound(force = false) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('zestmed_play_notification_sound', { detail: { force } }));
}

// Auto-unlock AudioContext on user interaction
if (typeof window !== 'undefined') {
  const unlockAudioContext = () => {
    try {
      const ctx = getOrCreateAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (_) {}
    window.removeEventListener('click', unlockAudioContext);
    window.removeEventListener('touchstart', unlockAudioContext);
    window.removeEventListener('keydown', unlockAudioContext);
  };

  window.addEventListener('click', unlockAudioContext, { passive: true });
  window.addEventListener('touchstart', unlockAudioContext, { passive: true });
  window.addEventListener('keydown', unlockAudioContext, { passive: true });

  window.addEventListener('zestmed_play_notification_sound', (e) => {
    playNotificationSound(Boolean(e?.detail?.force));
  });

  window.addEventListener('zestmed_new_notification', (e) => {
    playNotificationSound(Boolean(e?.detail?.force));
  });
}
