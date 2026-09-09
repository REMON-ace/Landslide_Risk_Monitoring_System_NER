/**
 * Emergency Audio Warning Synthesizer
 *
 * Synthesizes a short, attention-grabbing emergency attention signal
 * inspired by civil protection / Wireless Emergency Alert (WEA) conventions,
 * using dual-frequency synthesized audio (853 Hz & 960 Hz harmonic combination).
 *
 * NOTE: This is a standalone Web Audio API implementation for web/PWA civil
 * protection simulations and is not a copy of official proprietary WEA carrier signals.
 */

class EmergencyAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.activeOscillators = [];
    this.activeGainNodes = [];
    this.timeoutHandles = [];
    this.isPlaying = false;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  /**
   * Resume audio context on user interaction to comply with browser autoplay policies.
   */
  async unlockAudio() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        return true;
      } catch (e) {
        return false;
      }
    }
    return Boolean(ctx);
  }

  isUnlocked() {
    const ctx = this.getAudioContext();
    return Boolean(ctx && ctx.state === 'running');
  }

  /**
   * Plays a short, attention-grabbing dual-tone emergency burst.
   * Pattern: 2 bursts of 0.55s each with 0.15s pause (~1.3s total duration).
   * Frequencies: 853 Hz (primary attention tone) + 960 Hz (alert interval).
   */
  playEmergencySignal() {
    this.stop();

    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.isPlaying = true;

    // Master volume gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.activeGainNodes.push(masterGain);

    // Primary frequency (853 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(853, ctx.currentTime);
    osc1.connect(masterGain);

    // Secondary frequency (960 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(960, ctx.currentTime);
    osc2.connect(masterGain);

    const now = ctx.currentTime;
    const burstDuration = 0.55;
    const pauseDuration = 0.15;

    // Burst 1: 0.0s to 0.55s
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.04);
    masterGain.gain.setValueAtTime(0.26, now + burstDuration - 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + burstDuration);

    // Burst 2: 0.70s to 1.25s
    const burst2Start = now + burstDuration + pauseDuration;
    const burst2End = burst2Start + burstDuration;
    masterGain.gain.setValueAtTime(0.001, burst2Start);
    masterGain.gain.exponentialRampToValueAtTime(0.3, burst2Start + 0.04);
    masterGain.gain.setValueAtTime(0.28, burst2End - 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.001, burst2End);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    osc1.stop(burst2End + 0.05);
    osc2.stop(burst2End + 0.05);

    this.activeOscillators.push(osc1, osc2);

    // Cleanup when done
    const totalMs = (burst2End - now + 0.1) * 1000;
    const timer = setTimeout(() => {
      this.stop();
    }, totalMs);
    this.timeoutHandles.push(timer);
  }

  /**
   * Immediately stops any playing emergency tone and clears scheduled audio.
   */
  stop() {
    this.isPlaying = false;
    this.timeoutHandles.forEach(clearTimeout);
    this.timeoutHandles = [];

    const now = this.audioCtx ? this.audioCtx.currentTime : 0;
    this.activeGainNodes.forEach((gain) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        gain.disconnect();
      } catch (e) {}
    });
    this.activeGainNodes = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }
}

export const emergencyAudio = new EmergencyAudioSynthesizer();
