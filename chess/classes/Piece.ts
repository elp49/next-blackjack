import Tile from './Tile';

/* export const WHITE_PIECE_UNICODES = {
  PAWN: '\u2659',
  KNIGHT: '\u2658',
  BISHOP: '\u2657',
  ROOK: '\u2656',
  QUEEN: '\u2655',
  KING: '\u2654',
};
export const BLACK_PIECE_UNICODES = {
  PAWN: '\u265F',
  KNIGHT: '\u265E',
  BISHOP: '\u265D',
  ROOK: '\u265C',
  QUEEN: '\u265B',
  KING: '\u265A',
}; */

export const ROWS_PAWN = [2, 7];
export const ROWS_SPECIAL = [1, 8];

/*
 * windows/android/ios render chess unicode differently
 * switching to pngs
export enum PieceEnum {
  Pawn = '\u265F',
  Knight = '\u265E',
  Bishop = '\u265D',
  Rook = '\u265C',
  Queen = '\u265B',
  King = '\u265A',
} */

export enum PieceEnum {
  Pawn = 'pawn',
  Knight = 'knight',
  Bishop = 'bishop',
  Rook = 'rook',
  Queen = 'queen',
  King = 'king',
}

export interface IPieceProps {
  isWhite: boolean;
  type: PieceEnum;
  tile: Tile; // Tile also has Piece reference
}

class Piece {
  private props: IPieceProps;

  public get IsWhite(): boolean {
    return this.props.isWhite;
  }
  public get Type(): PieceEnum {
    return this.props.type;
  }
  public get Tile(): Tile {
    return this.props.tile;
  }

  public IsPlayersPiece(isPlayerWhite: boolean): boolean {
    return this.props.isWhite === isPlayerWhite;
  }

  constructor(props: IPieceProps) {
    this.props = props;

    this.props.tile.setPiece(this);
  }

  public setTile(tile: Tile): void {
    this.props.tile = tile;
    this.props.tile.setPiece(this);
  }

  public toString(): string {
    return `{isWhite:${this.IsWhite},  type:${this.Type}}`;
  }

  public clone(tile: Tile): Piece {
    return new Piece({ ...this.props, tile });
  }
}

export default Piece;
