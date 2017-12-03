import { Note } from './note';

export class Sequence {
  ac: AudioContext;
  tempo: number;
  loop: boolean = true;
  smoothing: number = 0;
  staccato: number = 0;
  notes: Note[] = [];
  gain: GainNode;
  bass: BiquadFilterNode;
  mid: BiquadFilterNode;
  treble: BiquadFilterNode;
  osc?: OscillatorNode;

  constructor(ac: AudioContext, tempo: number, arr: string[]) {
    this.ac = ac;
    this.createFxNodes();
    this.tempo = tempo;
    this.push.apply(this, arr || []);
  }

  createFxNodes() {
    this.gain = this.ac.createGain();

    this.bass = this.ac.createBiquadFilter();
    this.bass.type = 'peaking';
    this.bass.frequency.value = 100;
    this.gain.connect(this.bass);

    this.mid = this.ac.createBiquadFilter();
    this.mid.type = 'peaking';
    this.mid.frequency.value = 1000;
    this.bass.connect(this.mid);

    this.treble = this.ac.createBiquadFilter();
    this.treble.type = 'peaking';
    this.treble.frequency.value = 2500;
    this.mid.connect(this.treble);

    this.treble.connect(this.ac.destination);
    return this;
  }

  push(...notes: (string | Note)[]) {
    notes.forEach((note) => {
      this.notes.push(note instanceof Note ? note : new Note(note));
    });
    return this;
  }

  // get the next note
  getNextNote(index: number) {
    return this.notes[index < this.notes.length - 1 ? index + 1 : 0];
  };

  scheduleNote(index: number, when: number) {
    const duration = 60 / this.tempo * this.notes[index].duration;
    const cutoff = duration * (1 - (this.staccato || 0));

    this.setFrequency(this.notes[index].frequency, when);

    if (this.smoothing && this.notes[index].frequency) {
      this.slide(index, when, cutoff);
    }

    this.setFrequency(0, when + cutoff);
    return when + duration;
  };

  // set frequency at time
  setFrequency(freq: number, when: number) {
    this.osc.frequency.setValueAtTime(freq, when);
    return this;
  };

  // ramp to frequency at time
  rampFrequency(freq: number, when: number) {
    this.osc.frequency.linearRampToValueAtTime(freq, when);
    return this;
  };

  slide(index: number, when: number, cutoff: number) {
    const next = this.getNextNote(index);
    const start = this.getSlideStartDelay(cutoff);
    this.setFrequency(this.notes[index].frequency, when + start);
    this.rampFrequency(next.frequency, when + cutoff);
    return this;
  }

  getSlideStartDelay(duration: number) {
    return duration - Math.min(duration, 60 / this.tempo * this.smoothing);
  };

  createOscillator() {
    this.stop();
    this.osc = this.ac.createOscillator();
    this.osc.type = 'triangle';
    this.osc.connect(this.gain);
    return this;
  }

  stop() {
    if (this.osc) {
      this.osc.onended = null;
      this.osc.disconnect();
      this.osc = null;
    }
    return this;
  }

  play(when?: number) {
    when = typeof when === 'number' ? when : this.ac.currentTime;

    this.createOscillator();
    this.osc.start(when);

    this.notes.forEach((note, i) => {
      when = this.scheduleNote(i, when);
    });

    this.osc.stop(when);
    this.osc.onended = this.loop ? this.play.bind(this, when) : null;

    return this;
  };
}
