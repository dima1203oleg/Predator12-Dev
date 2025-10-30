"use strict";
// Sound System for Nexus Core
// Provides ambient and interactive sound effects
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopAmbient = exports.playAlert = exports.playClick = exports.playActivation = exports.playAmbient = exports.initializeSoundSystem = exports.soundSystem = void 0;
class NexusSoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.activeSources = new Map();
        this.masterVolume = 0.5;
        this.enabled = true;
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    // Initialize audio context (requires user interaction)
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                yield this.audioContext.resume();
            }
        });
    }
    // Generate procedural sounds using Web Audio API
    generateAmbient() {
        if (!this.audioContext)
            return null;
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
    generateActivation() {
        if (!this.audioContext)
            return null;
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
    generateClick() {
        if (!this.audioContext)
            return null;
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
    generateAlert() {
        if (!this.audioContext)
            return null;
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
        if (ambient)
            this.sounds.set('ambient', ambient);
        if (activation)
            this.sounds.set('activation', activation);
        if (click)
            this.sounds.set('click', click);
        if (alert)
            this.sounds.set('alert', alert);
    }
    // Play sound with configuration
    play(soundName, config = {}) {
        if (!this.enabled || !this.audioContext)
            return;
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
            gainNode.gain.linearRampToValueAtTime((config.volume || 1) * this.masterVolume, this.audioContext.currentTime + config.fadeIn);
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
    stop(soundName, fadeOut) {
        const source = this.activeSources.get(soundName);
        if (!source || !this.audioContext)
            return;
        if (fadeOut) {
            const gainNode = source.context.createGain();
            gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut);
            setTimeout(() => source.stop(), fadeOut * 1000);
        }
        else {
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
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    // Enable/disable sound system
    setEnabled(enabled) {
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
exports.soundSystem = new NexusSoundSystem();
// Initialize on user interaction
const initializeSoundSystem = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.soundSystem.initialize();
    exports.soundSystem.loadSounds();
});
exports.initializeSoundSystem = initializeSoundSystem;
// Convenience functions
const playAmbient = () => exports.soundSystem.play('ambient', { loop: true, volume: 0.3, fadeIn: 2 });
exports.playAmbient = playAmbient;
const playActivation = () => exports.soundSystem.play('activation', { volume: 0.5 });
exports.playActivation = playActivation;
const playClick = () => exports.soundSystem.play('click', { volume: 0.4 });
exports.playClick = playClick;
const playAlert = () => exports.soundSystem.play('alert', { volume: 0.6 });
exports.playAlert = playAlert;
const stopAmbient = () => exports.soundSystem.stop('ambient', 2);
exports.stopAmbient = stopAmbient;
exports.default = exports.soundSystem;
