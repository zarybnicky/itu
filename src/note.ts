const enharmonics = 'B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb';
const middleC = 440 * Math.pow(Math.pow(2, 1 / 12), -9);
const numeric = /^[0-9.]+$/;
const octaveOffset = 4;
const space = /\s+/;
const num = /(\d+)/;
const offsets: { [i: string]: number } = {};

enharmonics.split('|').forEach(function(val, i) {
  val.split('-').forEach(function(note) {
    offsets[note] = i;
  });
});

export class Note {
  frequency: number;
  duration: number;

  constructor(str: string) {
    var couple = str.split(space);
    this.frequency = Note.getFrequency(couple[0]) || 0;
    this.duration = Note.getDuration(couple[1]) || 0;
  }

  static getFrequency(name: string) {
    const couple = name.split(num);
    const distance = offsets[couple[0]];
    const octaveDiff = (parseInt(couple[1]) || octaveOffset) - octaveOffset;
    const freq = middleC * Math.pow(Math.pow(2, 1 / 12), distance);
    return freq * Math.pow(2, octaveDiff);
  }

  static getDuration(symbol: string) {
    return numeric.test(symbol) ? parseFloat(symbol) :
      symbol.toLowerCase().split('').reduce(function(prev, curr) {
        return prev + (curr === 'w' ? 4 : curr === 'h' ? 2 :
          curr === 'q' ? 1 : curr === 'e' ? 0.5 :
            curr === 's' ? 0.25 : 0);
      }, 0);
  }
}
