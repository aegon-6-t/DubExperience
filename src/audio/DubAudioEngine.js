/**
 * DubAudioEngine.js
 * High-performance Web Audio API engine for Dub Sound System Preamp.
 * Features:
 * - Low-latency audio player routing with HTML5 AudioElement
 * - 3-Band Preamp & Kill Switches (Kill Bass Highpass 250Hz, Kill Mid, Kill High)
 * - Dub Siren Generator (Modulated Oscillator + LFO + Envelope Gate)
 * - Vintage Dub Delay (Tape echo feedback loop with lowpass damping & soft saturation)
 * - Real-time Master Analyser (VU meter & Spectrum data)
 */

export class DubAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    // Track Player
    this.audioElement = null;
    this.sourceNode = null;
    this.playerGain = null;
    this.trackDelaySend = null;

    // Kill Switches & EQ Nodes
    this.bassKillFilter = null;
    this.lowShelfFilter = null;
    this.midKillFilter = null;
    this.highKillFilter = null;
    this.highShelfFilter = null;

    // Dub Siren Nodes
    this.sirenOsc = null;
    this.sirenLfo = null;
    this.sirenLfoGain = null;
    this.sirenGate = null;
    this.sirenVolumeNode = null;
    this.sirenDelaySend = null;

    // Dub Delay Nodes
    this.delayInputBus = null;
    this.delayNode = null;
    this.delayFeedbackNode = null;
    this.delayToneFilter = null;
    this.delayHighpass = null;
    this.delaySaturation = null;
    this.delayWetGain = null;

    // Master & Analyser
    this.masterBus = null;
    this.analyser = null;

    // Parameters Cache
    this.params = {
      // Player
      trackVolume: 0.85,
      trackDelaySend: 0.35,

      // EQ & Kills
      killBass: false,
      killMid: false,
      killHigh: false,
      lowGain: 0,
      midGain: 0,
      highGain: 0,

      // Siren
      sirenPitch: 580,
      sirenLfoRate: 5.5,
      sirenLfoDepth: 380,
      sirenWave: 'square',
      sirenLfoWave: 'sine',
      sirenVolume: 0.75,
      sirenDelaySend: 0.65,
      sirenTriggered: false,

      // Delay
      delayTime: 0.38,
      delayFeedback: 0.62,
      delayTone: 2800,
      delayWet: 0.5,

      // Master
      masterVolume: 0.9,
    };

    // Subscriptions
    this.listeners = new Set();
  }

  /**
   * Initializes the AudioContext upon user gesture.
   */
  async init(audioElement) {
    if (this.isInitialized && this.ctx) {
      await this.ensureContext();
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });
    this.audioElement = audioElement;

    // 1. Master Output & Analyser
    this.masterBus = this.ctx.createGain();
    this.masterBus.gain.setValueAtTime(this.params.masterVolume, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterBus.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // 2. Setup Delay FX Loop
    this.setupDelay();

    // 3. Setup EQ & Kill Switch Chain
    this.setupEQChain();

    // 4. Setup Audio Element Player Routing
    this.setupPlayerSource();

    // 5. Setup Dub Siren Synth
    this.setupDubSiren();

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        // will resume on next user gesture
      }
    }

    this.isInitialized = true;
    this.notify();
  }

  /**
   * Ensure audio context is running (resume if suspended by browser auto-play policy)
   */
  async ensureContext() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }
  }

  /**
   * Builds the Tape-style Dub Delay feedback loop.
   */
  setupDelay() {
    const ctx = this.ctx;

    this.delayInputBus = ctx.createGain();
    this.delayNode = ctx.createDelay(4.0);
    this.delayNode.delayTime.setValueAtTime(this.params.delayTime, ctx.currentTime);

    this.delayFeedbackNode = ctx.createGain();
    this.delayFeedbackNode.gain.setValueAtTime(this.params.delayFeedback, ctx.currentTime);

    // Warm analog lowpass filter inside feedback loop
    this.delayToneFilter = ctx.createBiquadFilter();
    this.delayToneFilter.type = 'lowpass';
    this.delayToneFilter.frequency.setValueAtTime(this.params.delayTone, ctx.currentTime);
    this.delayToneFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    // Highpass to eliminate feedback mud
    this.delayHighpass = ctx.createBiquadFilter();
    this.delayHighpass.type = 'highpass';
    this.delayHighpass.frequency.setValueAtTime(120, ctx.currentTime);

    // Soft saturation curve (warm tape compression)
    this.delaySaturation = ctx.createWaveShaper();
    this.delaySaturation.curve = this.makeSoftClipCurve(256);
    this.delaySaturation.oversample = '2x';

    // Delay Wet Return
    this.delayWetGain = ctx.createGain();
    this.delayWetGain.gain.setValueAtTime(this.params.delayWet, ctx.currentTime);

    // Connect Feedback Loop:
    // Input -> Delay -> ToneFilter -> Highpass -> Saturation -> FeedbackGain -> Delay
    this.delayInputBus.connect(this.delayNode);
    this.delayNode.connect(this.delayToneFilter);
    this.delayToneFilter.connect(this.delayHighpass);
    this.delayHighpass.connect(this.delaySaturation);
    this.delaySaturation.connect(this.delayFeedbackNode);
    this.delayFeedbackNode.connect(this.delayNode);

    // Wet signal to Master Bus
    this.delaySaturation.connect(this.delayWetGain);
    this.delayWetGain.connect(this.masterBus);
  }

  /**
   * Builds the Preamp EQ & Kill Switch chain.
   */
  setupEQChain() {
    const ctx = this.ctx;

    // 1. Kill Bass Switch Filter:
    // When ON: Highpass at 250Hz (instantly cuts all bass frequencies)
    // When OFF: Highpass at 10Hz (transparent / sub-bass passes freely)
    this.bassKillFilter = ctx.createBiquadFilter();
    this.bassKillFilter.type = 'highpass';
    this.bassKillFilter.frequency.setValueAtTime(
      this.params.killBass ? 250 : 10,
      ctx.currentTime
    );
    this.bassKillFilter.Q.setValueAtTime(0.707, ctx.currentTime);

    // Low Shelf for bass boost/cut (+/- 12dB)
    this.lowShelfFilter = ctx.createBiquadFilter();
    this.lowShelfFilter.type = 'lowshelf';
    this.lowShelfFilter.frequency.setValueAtTime(150, ctx.currentTime);
    this.lowShelfFilter.gain.setValueAtTime(this.params.lowGain, ctx.currentTime);

    // 2. Kill Mid Filter:
    // Peaking filter at 1000Hz (Q: 0.9)
    // When Kill Mid is ON: -50dB cut
    // When OFF: follows midGain
    this.midKillFilter = ctx.createBiquadFilter();
    this.midKillFilter.type = 'peaking';
    this.midKillFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    this.midKillFilter.Q.setValueAtTime(0.9, ctx.currentTime);
    this.midKillFilter.gain.setValueAtTime(
      this.params.killMid ? -50 : this.params.midGain,
      ctx.currentTime
    );

    // 3. Kill High Filter:
    // Lowpass filter:
    // When Kill High is ON: lowpass at 1200Hz (cuts all highs/shakers/cymbals)
    // When OFF: lowpass at 20000Hz (full clarity)
    this.highKillFilter = ctx.createBiquadFilter();
    this.highKillFilter.type = 'lowpass';
    this.highKillFilter.frequency.setValueAtTime(
      this.params.killHigh ? 1200 : 20000,
      ctx.currentTime
    );

    // High Shelf for high boost/cut (+/- 12dB)
    this.highShelfFilter = ctx.createBiquadFilter();
    this.highShelfFilter.type = 'highshelf';
    this.highShelfFilter.frequency.setValueAtTime(4500, ctx.currentTime);
    this.highShelfFilter.gain.setValueAtTime(this.params.highGain, ctx.currentTime);

    // Cascade EQ Chain:
    // bassKill -> lowShelf -> midKill -> highShelf -> highKill -> masterBus
    this.bassKillFilter.connect(this.lowShelfFilter);
    this.lowShelfFilter.connect(this.midKillFilter);
    this.midKillFilter.connect(this.highShelfFilter);
    this.highShelfFilter.connect(this.highKillFilter);
    this.highKillFilter.connect(this.masterBus);
  }

  /**
   * Connects the HTML5 audio element into Web Audio graph.
   */
  setupPlayerSource() {
    if (!this.audioElement || this.sourceNode) return;

    try {
      this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);

      this.playerGain = this.ctx.createGain();
      this.playerGain.gain.setValueAtTime(this.params.trackVolume, this.ctx.currentTime);

      this.trackDelaySend = this.ctx.createGain();
      this.trackDelaySend.gain.setValueAtTime(this.params.trackDelaySend, this.ctx.currentTime);

      // Connect source to playerGain
      this.sourceNode.connect(this.playerGain);

      // Split 1: playerGain -> EQ & Kill Chain -> Master
      this.playerGain.connect(this.bassKillFilter);

      // Split 2: playerGain -> Track Delay Send -> Delay FX Loop
      this.playerGain.connect(this.trackDelaySend);
      this.trackDelaySend.connect(this.delayInputBus);
    } catch (err) {
      console.warn('MediaElementSource already connected or error:', err);
    }
  }

  /**
   * Builds the Dub Siren Synth:
   * Siren Osc (Carrier) modulated by LFO -> Gate Envelope -> Volume -> Master & Delay Send
   */
  setupDubSiren() {
    const ctx = this.ctx;

    // Carrier Oscillator
    this.sirenOsc = ctx.createOscillator();
    this.sirenOsc.type = this.params.sirenWave;
    this.sirenOsc.frequency.setValueAtTime(this.params.sirenPitch, ctx.currentTime);

    // LFO Oscillator
    this.sirenLfo = ctx.createOscillator();
    this.sirenLfo.type = this.params.sirenLfoWave;
    this.sirenLfo.frequency.setValueAtTime(this.params.sirenLfoRate, ctx.currentTime);

    // LFO Depth
    this.sirenLfoGain = ctx.createGain();
    this.sirenLfoGain.gain.setValueAtTime(this.params.sirenLfoDepth, ctx.currentTime);

    // Modulation connection: LFO -> LfoGain -> sirenOsc.frequency
    this.sirenLfo.connect(this.sirenLfoGain);
    this.sirenLfoGain.connect(this.sirenOsc.frequency);

    // Gate Envelope Node (0 = silent, 1 = playing)
    this.sirenGate = ctx.createGain();
    this.sirenGate.gain.setValueAtTime(0, ctx.currentTime);

    // Siren Volume
    this.sirenVolumeNode = ctx.createGain();
    this.sirenVolumeNode.gain.setValueAtTime(this.params.sirenVolume, ctx.currentTime);

    // Siren Delay Send
    this.sirenDelaySend = ctx.createGain();
    this.sirenDelaySend.gain.setValueAtTime(this.params.sirenDelaySend, ctx.currentTime);

    // Route: Osc -> Gate -> Volume -> Direct to Master & Send to Delay
    this.sirenOsc.connect(this.sirenGate);
    this.sirenGate.connect(this.sirenVolumeNode);

    // Direct Siren signal into Master
    this.sirenVolumeNode.connect(this.masterBus);

    // Siren Send into Delay FX Loop
    this.sirenVolumeNode.connect(this.sirenDelaySend);
    this.sirenDelaySend.connect(this.delayInputBus);

    // Start oscillators (they stay active, gated by sirenGate)
    this.sirenOsc.start();
    this.sirenLfo.start();
  }

  /**
   * Generates a soft-clip distortion curve for warm dub saturation in the delay loop.
   */
  makeSoftClipCurve(samples = 256) {
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      // Soft saturation using tanh
      curve[i] = Math.tanh(x * 1.5) / Math.tanh(1.5);
    }
    return curve;
  }

  // ==========================================
  // KILL SWITCHES & EQ CONTROLS
  // ==========================================

  setKillBass(active) {
    this.params.killBass = !!active;
    if (!this.bassKillFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    // BiquadFilter Highpass at 250Hz when active, 10Hz when inactive
    const targetFreq = this.params.killBass ? 250 : 10;
    this.bassKillFilter.frequency.cancelScheduledValues(now);
    this.bassKillFilter.frequency.setTargetAtTime(targetFreq, now, 0.005);
    this.notify();
  }

  setKillMid(active) {
    this.params.killMid = !!active;
    if (!this.midKillFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetGain = this.params.killMid ? -55 : this.params.midGain;
    this.midKillFilter.gain.cancelScheduledValues(now);
    this.midKillFilter.gain.setTargetAtTime(targetGain, now, 0.005);
    this.notify();
  }

  setKillHigh(active) {
    this.params.killHigh = !!active;
    if (!this.highKillFilter || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetFreq = this.params.killHigh ? 1200 : 20000;
    this.highKillFilter.frequency.cancelScheduledValues(now);
    this.highKillFilter.frequency.setTargetAtTime(targetFreq, now, 0.005);
    this.notify();
  }

  setLowGain(dB) {
    this.params.lowGain = Math.max(-15, Math.min(15, dB));
    if (!this.lowShelfFilter || !this.ctx) return;
    this.lowShelfFilter.gain.setTargetAtTime(this.params.lowGain, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setMidGain(dB) {
    this.params.midGain = Math.max(-15, Math.min(15, dB));
    if (!this.midKillFilter || !this.ctx) return;
    if (!this.params.killMid) {
      this.midKillFilter.gain.setTargetAtTime(this.params.midGain, this.ctx.currentTime, 0.02);
    }
    this.notify();
  }

  setHighGain(dB) {
    this.params.highGain = Math.max(-15, Math.min(15, dB));
    if (!this.highShelfFilter || !this.ctx) return;
    this.highShelfFilter.gain.setTargetAtTime(this.params.highGain, this.ctx.currentTime, 0.02);
    this.notify();
  }

  // ==========================================
  // DUB SIREN CONTROLS
  // ==========================================

  triggerSiren(down) {
    this.ensureContext();
    this.params.sirenTriggered = !!down;
    if (!this.sirenGate || !this.ctx) return;
    const now = this.ctx.currentTime;

    this.sirenGate.gain.cancelScheduledValues(now);
    if (down) {
      // Fast attack (3ms anti-click)
      this.sirenGate.gain.setValueAtTime(this.sirenGate.gain.value, now);
      this.sirenGate.gain.linearRampToValueAtTime(1.0, now + 0.004);
    } else {
      // Natural release
      this.sirenGate.gain.setValueAtTime(this.sirenGate.gain.value, now);
      this.sirenGate.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      this.sirenGate.gain.setValueAtTime(0, now + 0.045);
    }
    this.notify();
  }

  setSirenPitch(freq) {
    this.params.sirenPitch = Math.max(60, Math.min(3000, freq));
    if (!this.sirenOsc || !this.ctx) return;
    this.sirenOsc.frequency.setTargetAtTime(this.params.sirenPitch, this.ctx.currentTime, 0.015);
    this.notify();
  }

  setSirenLfoRate(rate) {
    this.params.sirenLfoRate = Math.max(0.1, Math.min(40, rate));
    if (!this.sirenLfo || !this.ctx) return;
    this.sirenLfo.frequency.setTargetAtTime(this.params.sirenLfoRate, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setSirenLfoDepth(depth) {
    this.params.sirenLfoDepth = Math.max(0, Math.min(1500, depth));
    if (!this.sirenLfoGain || !this.ctx) return;
    this.sirenLfoGain.gain.setTargetAtTime(this.params.sirenLfoDepth, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setSirenWave(type) {
    const valid = ['sine', 'square', 'sawtooth', 'triangle'];
    if (!valid.includes(type)) return;
    this.params.sirenWave = type;
    if (this.sirenOsc) {
      this.sirenOsc.type = type;
    }
    this.notify();
  }

  setSirenLfoWave(type) {
    const valid = ['sine', 'square', 'sawtooth', 'triangle'];
    if (!valid.includes(type)) return;
    this.params.sirenLfoWave = type;
    if (this.sirenLfo) {
      this.sirenLfo.type = type;
    }
    this.notify();
  }

  setSirenVolume(val) {
    this.params.sirenVolume = Math.max(0, Math.min(1.5, val));
    if (!this.sirenVolumeNode || !this.ctx) return;
    this.sirenVolumeNode.gain.setTargetAtTime(this.params.sirenVolume, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setSirenDelaySend(val) {
    this.params.sirenDelaySend = Math.max(0, Math.min(1.2, val));
    if (!this.sirenDelaySend || !this.ctx) return;
    this.sirenDelaySend.gain.setTargetAtTime(this.params.sirenDelaySend, this.ctx.currentTime, 0.02);
    this.notify();
  }

  // ==========================================
  // DUB DELAY FX LOOP CONTROLS
  // ==========================================

  setDelayTime(sec) {
    this.params.delayTime = Math.max(0.02, Math.min(2.5, sec));
    if (!this.delayNode || !this.ctx) return;
    // Tape delay pitch glide effect when changing time
    this.delayNode.delayTime.setTargetAtTime(this.params.delayTime, this.ctx.currentTime, 0.04);
    this.notify();
  }

  setDelayFeedback(amt) {
    // Allows up to 1.05 for dub self-oscillation
    this.params.delayFeedback = Math.max(0, Math.min(1.05, amt));
    if (!this.delayFeedbackNode || !this.ctx) return;
    this.delayFeedbackNode.gain.setTargetAtTime(this.params.delayFeedback, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setDelayTone(freq) {
    this.params.delayTone = Math.max(400, Math.min(12000, freq));
    if (!this.delayToneFilter || !this.ctx) return;
    this.delayToneFilter.frequency.setTargetAtTime(this.params.delayTone, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setDelayWet(val) {
    this.params.delayWet = Math.max(0, Math.min(1.2, val));
    if (!this.delayWetGain || !this.ctx) return;
    this.delayWetGain.gain.setTargetAtTime(this.params.delayWet, this.ctx.currentTime, 0.02);
    this.notify();
  }

  /**
   * Sound system classic trick: instant feedback kill to stop runaway delays dead!
   */
  killFeedback() {
    if (!this.delayFeedbackNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.delayFeedbackNode.gain.cancelScheduledValues(now);
    this.delayFeedbackNode.gain.setValueAtTime(0, now);
    setTimeout(() => {
      if (this.delayFeedbackNode && this.ctx) {
        this.delayFeedbackNode.gain.setTargetAtTime(this.params.delayFeedback, this.ctx.currentTime, 0.05);
      }
    }, 150);
  }

  // ==========================================
  // PLAYER CONTROLS
  // ==========================================

  setTrackVolume(val) {
    this.params.trackVolume = Math.max(0, Math.min(1.5, val));
    if (!this.playerGain || !this.ctx) return;
    this.playerGain.gain.setTargetAtTime(this.params.trackVolume, this.ctx.currentTime, 0.02);
    this.notify();
  }

  setTrackDelaySend(val) {
    this.params.trackDelaySend = Math.max(0, Math.min(1.2, val));
    if (!this.trackDelaySend || !this.ctx) return;
    this.trackDelaySend.gain.setTargetAtTime(this.params.trackDelaySend, this.ctx.currentTime, 0.02);
    this.notify();
  }

  // ==========================================
  // MASTER CONTROLS & ANALYSER
  // ==========================================

  setMasterVolume(val) {
    this.params.masterVolume = Math.max(0, Math.min(1.5, val));
    if (!this.masterBus || !this.ctx) return;
    this.masterBus.gain.setTargetAtTime(this.params.masterVolume, this.ctx.currentTime, 0.02);
    this.notify();
  }

  /**
   * Retrieves live audio analysis data for VU meters & Spectrum visualizers
   */
  getAnalysisData(frequencyDataArray, timeDomainArray) {
    if (!this.analyser) {
      return { rms: 0, peak: 0 };
    }

    if (frequencyDataArray) {
      this.analyser.getByteFrequencyData(frequencyDataArray);
    }

    if (timeDomainArray) {
      this.analyser.getByteTimeDomainData(timeDomainArray);

      // Compute RMS & Peak from time domain
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < timeDomainArray.length; i++) {
        const val = (timeDomainArray[i] - 128) / 128; // -1 to +1
        sum += val * val;
        const absVal = Math.abs(val);
        if (absVal > peak) peak = absVal;
      }
      const rms = Math.sqrt(sum / timeDomainArray.length);
      return { rms, peak };
    }

    return { rms: 0, peak: 0 };
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.params);
    }
  }

  getParams() {
    return { ...this.params };
  }
}

// Export singleton instance
export const dubAudioEngine = new DubAudioEngine();
