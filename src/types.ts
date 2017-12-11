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
