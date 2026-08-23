// Web Audio API Procedural Sound Synthesizer
// Clean, organic mechanical clock ticks and harmonic focus chimes without external assets

class SoundEngine {
	private ctx: AudioContext | null = null;

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

	// Play an acoustic mechanical clock tick
	// Alternates between higher pitch 'tick' (e.g. 850Hz) and lower pitch 'tock' (e.g. 650Hz)
	playClockTick(isEvenSecond: boolean = true) {
		const ctx = this.getContext();
		if (!ctx) return;

		try {
			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			const filter = ctx.createBiquadFilter();

			const baseFreq = isEvenSecond ? 820 : 640;

			osc.type = "triangle";
			osc.frequency.setValueAtTime(baseFreq, now);
			osc.frequency.exponentialRampToValueAtTime(140, now + 0.022);

			filter.type = "bandpass";
			filter.frequency.setValueAtTime(baseFreq, now);
			filter.Q.setValueAtTime(2.5, now);

			gain.gain.setValueAtTime(0.15, now);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

			osc.connect(filter);
			filter.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + 0.025);
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
