export enum Page {
  Home,
  SinglePlayer,
  MultiPlayer,
  Settings,
  Help,
  Board,
}
export enum Variant {
  threeInARow = 'Three-in-a-row',
  fourInARow = 'Four-in-a-row',
  fiveInARow = 'Five-in-a-row',
  sixInARow = 'Six-in-a-row',
}
export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}
export type Move = MoveInfo | 'undo';
export interface MoveInfo {
  isX: boolean;
  x: number;
  y: number;
}

export const fromVariant = (v: Variant) => {
  switch (v) {
    case Variant.threeInARow: return 3;
    case Variant.fourInARow: return 4;
    case Variant.fiveInARow: return 5;
    case Variant.sixInARow: return 6;
  }
}
export const toVariant = (n: number) => {
  switch (n) {
    case 3: return Variant.threeInARow;
    case 4: return Variant.fourInARow;
    case 5: return Variant.fiveInARow;
    case 6: return Variant.sixInARow;
  }
}
