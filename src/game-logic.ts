import { Variant, fromVariant, MoveInfo, range } from './types';

export function isWinner(board: MoveInfo[][], lastMove: MoveInfo, v: Variant): boolean {
  const variant = fromVariant(v);
  const { x, y, isX } = lastMove;

  const ranges = [range(-1, -variant), range(1, variant)];
  const diagL = (i: number) => (board[x + i] || [])[y - i];
  const diagR = (i: number) => (board[x + i] || [])[y + i];
  const verti = (i: number) => (board[x + i] || [])[y];
  const horiz = (i: number) => (board[x] || [])[y + i];

  const consecutiveBools = (s: number = 0, xs: boolean[]) => {
    let i = 0;
    while (i < xs.length && xs[i]) i++;
    return s + i;
  }
  return [diagL, diagR, verti, horiz]
    .map((f: (x: number) => MoveInfo) => ranges
      .map(xs => xs.map(f).map(v => v && v && v.isX === isX))
      .reduce(consecutiveBools, 0))
    .some(x => x + 1 >= variant);
}

export function findMove(board: MoveInfo[][]): MoveInfo {
  while (true) {
    const x = Math.floor(Math.random() * board.length);
    const y = Math.floor(Math.random() * board.length);
    if (board[x][y] === null) {
      return { x, y, isX: false };
    }
  }
}
