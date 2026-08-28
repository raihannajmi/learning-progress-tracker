// Web Audio API Procedural Sound Synthesizer
// Authentic mechanical clock movement ("ccsrek" / "scsrek") and harmonic focus chimes

class SoundEngine {
	private ctx: AudioContext | null = null;
	private noiseBuffer: AudioBuffer | null = null;

	private getContext(): AudioContext | null {
		if (typeof window === "undefined") return null;
		try {
			if (!this.ctx) {
				const AudioCtx =
					window.AudioContext ||
					(window as unknown as { webkitAudioContext: typeof AudioContext })
						.webkitAudioContext;
				if (AudioCtx) {
					this.ctx = new AudioCtx();
				}
			}
			if (this.ctx && this.ctx.state === "suspended") {
				this.ctx.resume();
			}
			return this.ctx;
		} catch {
			return null;
		}
	}

	private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
		if (!this.noiseBuffer || this.noiseBuffer.sampleRate !== ctx.sampleRate) {
			const bufferSize = Math.floor(ctx.sampleRate * 0.15); // 150ms buffer
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				data[i] = Math.random() * 2 - 1;
			}
			this.noiseBuffer = buffer;
		}
		return this.noiseBuffer;
	}

	// Play authentic Session-app style analog clock second-hand tick
	// Crisp, woody, rhythmic analog movement that alternates smoothly (tick / tock)
	playClockTick(isEvenSecond: boolean = true) {
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const now = ctx.currentTime;
			const noiseBuffer = this.getNoiseBuffer(ctx);

			// Master gain for this single tick
			const masterGain = ctx.createGain();
			masterGain.gain.setValueAtTime(0.45, now);
			masterGain.connect(ctx.destination);

			// 1. High-Frequency Tactile Escapement Snap (Jewel click & second hand step)
			const snapSource = ctx.createBufferSource();
			snapSource.buffer = noiseBuffer;

			const snapFilter = ctx.createBiquadFilter();
			snapFilter.type = "bandpass";
			// Alternates between crisp tick (~4200Hz) and slightly softer tock (~3400Hz)
			const snapFreq = isEvenSecond ? 4200 : 3400;
			snapFilter.frequency.setValueAtTime(snapFreq, now);
			snapFilter.Q.setValueAtTime(4.5, now);

			const snapGain = ctx.createGain();
			snapGain.gain.setValueAtTime(0.001, now);
			snapGain.gain.linearRampToValueAtTime(0.18, now + 0.0015);
			snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

			snapSource.connect(snapFilter);
			snapFilter.connect(snapGain);
			snapGain.connect(masterGain);

			snapSource.start(now);
			snapSource.stop(now + 0.015);

			// 2. Resonant Woody/Mechanical Cavity Impulse (The clean "tok/tak" body)
			const toneOsc = ctx.createOscillator();
			const toneGain = ctx.createGain();
			const toneFilter = ctx.createBiquadFilter();

			const startFreq = isEvenSecond ? 1450 : 1100;
			const endFreq = isEvenSecond ? 280 : 210;

			toneOsc.type = "triangle";
			toneOsc.frequency.setValueAtTime(startFreq, now);
			toneOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.016);

			toneFilter.type = "bandpass";
			toneFilter.frequency.setValueAtTime(startFreq * 0.85, now);
			toneFilter.Q.setValueAtTime(3.2, now);

			toneGain.gain.setValueAtTime(0.24, now);
			toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

			toneOsc.connect(toneFilter);
			toneFilter.connect(toneGain);
			toneGain.connect(masterGain);

			toneOsc.start(now);
			toneOsc.stop(now + 0.022);

			// 3. Subtle Sub-Micro Friction Tail (The mechanical gear mesh slide)
			const tailSource = ctx.createBufferSource();
			tailSource.buffer = noiseBuffer;

			const tailFilter = ctx.createBiquadFilter();
			tailFilter.type = "bandpass";
			tailFilter.frequency.setValueAtTime(
				isEvenSecond ? 2600 : 2100,
				now + 0.003,
			);
			tailFilter.Q.setValueAtTime(2.0, now + 0.003);

			const tailGain = ctx.createGain();
			tailGain.gain.setValueAtTime(0.001, now);
			tailGain.gain.linearRampToValueAtTime(0.06, now + 0.004);
			tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

			tailSource.connect(tailFilter);
			tailFilter.connect(tailGain);
			tailGain.connect(masterGain);

			tailSource.start(now);
			tailSource.stop(now + 0.024);
		} catch {
			// Ignore audio synthesis errors on locked browsers
		}
	}

	// Play pleasant harmonic completion chime (celebratory soft bell)
	playCompletionChime() {
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
			notes.forEach((freq, idx) => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				const now = ctx.currentTime + idx * 0.12;

				osc.type = "sine";
				osc.frequency.setValueAtTime(freq, now);

				gain.gain.setValueAtTime(0.18, now);
				gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(now);
				osc.stop(now + 0.9);
			});
		} catch {
			// Ignore
		}
	}
}

export const sound = new SoundEngine();
