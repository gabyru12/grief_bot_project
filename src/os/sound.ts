// Sound effects are synthesised with the Web Audio API: no sound files, no licences.
// Browsers only allow sound after the player has clicked something, so the audio
// context is created on the first click.

let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq: number, start: number, duration: number, volume: number, type: OscillatorType = 'sine'): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ctx.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function playSound(name: string): void {
  if (!ctx) return;
  switch (name) {
    case 'chime':
      tone(880, 0, 0.35, 0.08);
      tone(1320, 0.12, 0.45, 0.06);
      break;
    case 'error':
      tone(220, 0, 0.25, 0.08, 'square');
      break;
    case 'click':
      tone(1200, 0, 0.05, 0.04, 'triangle');
      break;
    default:
      break;
  }
}
