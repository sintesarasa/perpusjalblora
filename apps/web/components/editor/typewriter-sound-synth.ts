'use client';

/**
 * Procedural Typewriter Sound Synthesizer via Web Audio API
 * 100% zero-byte asset download, fully offline, instantaneous response (<5ms).
 * Simulates mechanical keystrokes, spacebar clack, backspace latch, and carriage return bell ding.
 */

class TypewriterAudioSynth {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Lazy initialize upon first user interaction
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.initContext();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Mechanical key press click (metal typebar striking ink ribbon onto paper)
   */
  public playKeyClick() {
    if (!this.isEnabled || !this.initContext() || !this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Noise burst for metal hammer strike
      const bufferSize = this.ctx.sampleRate * 0.035; // 35ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter centered around 1800-2400Hz (metallic snap)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1900 + Math.random() * 400, t);
      filter.Q.setValueAtTime(4, t);

      // Fast exponential decay envelope
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.035);

      // 2. Subtle low body resonance
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, t);
      oscGain.gain.setValueAtTime(0.08, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Ignore audio synthesis errors on strict platforms
    }
  }

  /**
   * Spacebar heavier mechanical clack
   */
  public playSpacebar() {
    if (!this.isEnabled || !this.initContext() || !this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }

  /**
   * Carriage Return (Enter key) — Authentic mechanical bell ding & carriage roll!
   */
  public playCarriageReturn() {
    if (!this.isEnabled || !this.initContext() || !this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Mechanical bell ding (clear high sine chime)
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bell.type = 'sine';
      bell.frequency.setValueAtTime(2480, t); // Crisp mechanical brass bell pitch

      bellGain.gain.setValueAtTime(0.25, t);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);

      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);

      bell.start(t);
      bell.stop(t + 0.4);

      // 2. Carriage slide friction click
      const slide = this.ctx.createOscillator();
      const slideGain = this.ctx.createGain();

      slide.type = 'sawtooth';
      slide.frequency.setValueAtTime(450, t + 0.05);
      slide.frequency.linearRampToValueAtTime(180, t + 0.12);

      slideGain.gain.setValueAtTime(0.06, t + 0.05);
      slideGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      slide.connect(slideGain);
      slideGain.connect(this.ctx.destination);

      slide.start(t + 0.05);
      slide.stop(t + 0.15);
    } catch {}
  }

  /**
   * Backspace latch click
   */
  public playBackspace() {
    if (!this.isEnabled || !this.initContext() || !this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(280, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch {}
  }
}

export const typewriterSynth = new TypewriterAudioSynth();
