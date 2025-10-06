// Sound System for Nexus Core
// Provides ambient and interactive sound effects

interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

class NexusSoundSystem {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private masterVolume: number = 0.5;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Initialize audio context (requires user interaction)
  async initialize() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate procedural sounds using Web Audio API
  generateAmbient(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 4;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Ambient drone with harmonics
        const fundamental = Math.sin(2 * Math.PI * 60 * t);
        const harmonic1 = Math.sin(2 * Math.PI * 120 * t) * 0.3;
        const harmonic2 = Math.sin(2 * Math.PI * 180 * t) * 0.2;
        const noise = (Math.random() - 0.5) * 0.05;
        
        data[i] = (fundamental + harmonic1 + harmonic2 + noise) * 0.1;
      }
    }

    return buffer;
  }

  generateActivation(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Sweep up with envelope
        const frequency = 200 + (t / duration) * 600;
        const envelope = Math.exp(-t * 5);
        const signal = Math.sin(2 * Math.PI * frequency * t) * envelope;
        
        data[i] = signal * 0.3;
      }
    }

    return buffer;
  }

  generateClick(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 40);
        const signal = (Math.random() - 0.5) * envelope;
        
        data[i] = signal * 0.2;
      }
    }

    return buffer;
  }

  generateAlert(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const duration = 1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        // Pulsing alert
        const pulse = Math.sin(2 * Math.PI * 3 * t) > 0 ? 1 : 0;
        const tone = Math.sin(2 * Math.PI * 800 * t);
        const envelope = Math.exp(-t * 2);
        
        data[i] = tone * pulse * envelope * 0.3;
      }
    }

    return buffer;
  }

  // Load and cache sounds
  loadSounds() {
    const ambient = this.generateAmbient();
    const activation = this.generateActivation();
    const click = this.generateClick();
    const alert = this.generateAlert();

    if (ambient) this.sounds.set('ambient', ambient);
    if (activation) this.sounds.set('activation', activation);
    if (click) this.sounds.set('click', click);
    if (alert) this.sounds.set('alert', alert);
  }

  // Play sound with configuration
  play(soundName: string, config: Partial<SoundConfig> = {}) {
    if (!this.enabled || !this.audioContext) return;

    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = sound;
    source.loop = config.loop || false;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = (config.volume || 1) * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Fade in
    if (config.fadeIn) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        (config.volume || 1) * this.masterVolume,
        this.audioContext.currentTime + config.fadeIn
      );
    }

    source.start(0);

    // Track active source
    this.activeSources.set(soundName, source);

    // Cleanup when finished
    source.onended = () => {
      this.activeSources.delete(soundName);
    };

    return source;
  }

  // Stop specific sound
  stop(soundName: string, fadeOut?: number) {
    const source = this.activeSources.get(soundName);
    if (!source || !this.audioContext) return;

    if (fadeOut) {
      const gainNode = source.context.createGain();
      gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut);
      setTimeout(() => source.stop(), fadeOut * 1000);
    } else {
      source.stop();
    }

    this.activeSources.delete(soundName);
  }

  // Stop all sounds
  stopAll() {
    this.activeSources.forEach((source, name) => {
      source.stop();
    });
    this.activeSources.clear();
  }

  // Set master volume
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Enable/disable sound system
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  // Clean up resources
  dispose() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
export const soundSystem = new NexusSoundSystem();

// Initialize on user interaction
export const initializeSoundSystem = async () => {
  await soundSystem.initialize();
  soundSystem.loadSounds();
};

// Convenience functions
export const playAmbient = () => soundSystem.play('ambient', { loop: true, volume: 0.3, fadeIn: 2 });
export const playActivation = () => soundSystem.play('activation', { volume: 0.5 });
export const playClick = () => soundSystem.play('click', { volume: 0.4 });
export const playAlert = () => soundSystem.play('alert', { volume: 0.6 });
export const stopAmbient = () => soundSystem.stop('ambient', 2);

export default soundSystem;
