/**
 * Procedural Web Audio Sound Synthesizer
 * Zero external MP3/audio files needed - 100% reliable, zero 404s, works offline!
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: any = null;

  constructor() {
    // Read user mute preference from localStorage
    try {
      const savedMute = localStorage.getItem('rickshaw_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('rickshaw_sound_muted', String(muted));
    } catch {}
    if (muted) {
      this.stopPoliceSiren();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Authentic Bangladeshi Rickshaw "Tung-Tang" Brass Bell
   * Two rapid high-pitched metallic strikes with rich ringing harmonics
   */
  public playTungBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const strikes = [
      { time: 0, freq: 2450, harm: 4900, gain: 0.35 },
      { time: 0.11, freq: 2850, harm: 5700, gain: 0.4 },
    ];

    strikes.forEach((strike) => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(strike.freq, this.ctx!.currentTime + strike.time);
      osc2.frequency.setValueAtTime(strike.harm, this.ctx!.currentTime + strike.time);

      gainNode.gain.setValueAtTime(0.001, this.ctx!.currentTime + strike.time);
      gainNode.gain.exponentialRampToValueAtTime(strike.gain, this.ctx!.currentTime + strike.time + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + strike.time + 0.45);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx!.destination);

      osc1.start(this.ctx!.currentTime + strike.time);
      osc2.start(this.ctx!.currentTime + strike.time);

      osc1.stop(this.ctx!.currentTime + strike.time + 0.5);
      osc2.stop(this.ctx!.currentTime + strike.time + 0.5);
    });
  }

  /**
   * Mechanical bicycle pedal chain tick
   */
  public playPedalTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140 + Math.random() * 60, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.04);

    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Truck / Bus Dual-Tone Air Horn ("প্যাঁ-প্যাঁ!")
   */
  public playHorn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(185, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(235, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.22, this.ctx.currentTime + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.6);
    osc2.stop(this.ctx.currentTime + 0.6);
  }

  /**
   * Continuous Police Siren on Highway Detection
   */
  public startPoliceSiren() {
    if (this.isMuted || this.sirenOsc) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sawtooth';
      this.sirenGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      let toggle = false;
      this.sirenOsc.frequency.setValueAtTime(650, this.ctx.currentTime);
      this.sirenOsc.start();

      this.sirenInterval = setInterval(() => {
        if (!this.ctx || !this.sirenOsc) return;
        toggle = !toggle;
        const targetFreq = toggle ? 960 : 640;
        this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.3);
      }, 350);
    } catch {}
  }

  public stopPoliceSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenGain?.gain.linearRampToValueAtTime(0.001, this.ctx?.currentTime || 0);
        this.sirenOsc.stop((this.ctx?.currentTime || 0) + 0.1);
      } catch {}
      this.sirenOsc = null;
      this.sirenGain = null;
    }
  }

  /**
   * Cash / Coin Pickup Sound
   */
  public playCoinSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.28);
    });
  }

  /**
   * Cartoon Crash & Bounce Sound
   */
  public playCrashSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Low rumble thump + cartoon wobble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  /**
   * Comical Angry Crowd Tones
   */
  public playAngryMurmur() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const blips = [220, 180, 260, 190, 240];
    blips.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq + Math.random() * 30, this.ctx!.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.07 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.07);
      osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.15);
    });
  }

  /**
   * Level Cleared Victory Fanfare
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    melody.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.12);
      osc.stop(this.ctx!.currentTime + idx * 0.12 + 0.45);
    });
  }
}

export const soundManager = new SoundController();
