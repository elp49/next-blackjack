import { TilePosition, X_AXIS_VALUES } from '../components/BoardComponent';
import { Tile } from './Tile';

const WHITE_PIECE_UNICODES = {
  PAWN: '\u2659',
  KNIGHT: '\u2658',
  BISHOP: '\u2657',
  ROOK: '\u2656',
  QUEEN: '\u2655',
  KING: '\u2654',
};
const BLACK_PIECE_UNICODES = {
  PAWN: '\u265F',
  KNIGHT: '\u265E',
  BISHOP: '\u265D',
  ROOK: '\u265C',
  QUEEN: '\u265D',
  KING: '\u265A',
};

export const ROWS_PAWN = [2, 7];
export const ROWS_SPECIAL = [1, 8];

export enum PieceEnum {
  Pawn = 'PAWN',
  Knight = 'KNIGHT',
  Bishop = 'BISHOP',
  Rook = 'ROOK',
  Queen = 'QUEEN',
  King = 'KING',
}

const getSpecialPieceTypeByColumn = (x: string, isPlayerWhite: boolean): PieceEnum => {
  switch (X_AXIS_VALUES.indexOf(x)) {
    case 0:
    case 7:
      return PieceEnum.Rook;

    case 1:
    case 6:
      return PieceEnum.Knight;

    case 2:
    case 5:
      return PieceEnum.Bishop;

    case 3:
      if (isPlayerWhite) return PieceEnum.Queen;
      else return PieceEnum.King;

    case 4:
      if (isPlayerWhite) return PieceEnum.King;
      else return PieceEnum.Queen;

    default:
      break;
  }
};

export interface IPieceProps {
  isWhite: boolean;
  // type: PieceEnum;
  tile: Tile; // Tile also has Piece reference
}

export class Piece {
  private props: IPieceProps;
  private initialPosition: TilePosition;
  private type: PieceEnum;
  private unicode: string;

  public get Id(): string {
    return `piece-${this.type}-${this.initialPosition.x}${this.initialPosition.y}`;
  }

  public get IsWhite(): boolean {
    return this.props.isWhite;
  }
  public get Tile(): Tile {
    return this.props.tile;
  }

  public get InitialPosition(): TilePosition {
    return this.initialPosition;
  }
  public get Type(): PieceEnum {
    return this.type;
  }
  public get Unicode(): string {
    return this.unicode;
  }

  constructor(props: IPieceProps) {
    this.props = props;
    this.props.tile.setPiece(this);

    // record initial position
    this.initialPosition = this.props.tile.Position;

    this.setUnicode();
  }

  /* public popTile(): Tile {
    const tile = this.props.tile;
    this.props.tile = null;
    tile.popPiece();
    return tile;
  } */

  public setTile(tile: Tile): void {
    this.props.tile = tile;
    this.props.tile.setPiece(this);
  }

  public filterValidTiles(tiles: Tile[]): Tile[] {
    return tiles.filter((t, i) => {});
  }

  public toString(): string {
    return `isWhite:${this.IsWhite},  type:${this.Type}}`;
  }

  public clone(): Piece {
    const clone = new Piece({ ...this.props });
    clone.setTile(this.props.tile);
    return clone;
  }

  private setPieceType(): void {
    // assign piece type
    if (ROWS_PAWN.includes(this.props.tile.Position.y)) this.type = PieceEnum.Pawn;
    else if (ROWS_SPECIAL.includes(this.props.tile.Position.y))
      this.type = getSpecialPieceTypeByColumn(this.props.tile.Position.x, this.props.isWhite);
  }

  private setUnicode(): void {
    if (!this.type) this.setPieceType();

    // assign unicode
    switch (this.type) {
      // use black piece unicodes to fill with color
      case PieceEnum.Pawn:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.PAWN;
        // else this.unicode = BLACK_PIECE_UNICODES.PAWN;
        this.unicode = BLACK_PIECE_UNICODES.PAWN;
        break;

      case PieceEnum.Knight:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.KNIGHT;
        // else this.unicode = BLACK_PIECE_UNICODES.KNIGHT;
        this.unicode = BLACK_PIECE_UNICODES.KNIGHT;
        break;

      case PieceEnum.Bishop:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.BISHOP;
        // else this.unicode = BLACK_PIECE_UNICODES.BISHOP;
        this.unicode = BLACK_PIECE_UNICODES.BISHOP;
        break;

      case PieceEnum.Rook:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.ROOK;
        // else this.unicode = BLACK_PIECE_UNICODES.ROOK;
        this.unicode = BLACK_PIECE_UNICODES.ROOK;
        break;

      case PieceEnum.Queen:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.QUEEN;
        // else this.unicode = BLACK_PIECE_UNICODES.QUEEN;
        this.unicode = BLACK_PIECE_UNICODES.QUEEN;
        break;

      case PieceEnum.King:
        // if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.KING;
        // else this.unicode = BLACK_PIECE_UNICODES.KING;
        this.unicode = BLACK_PIECE_UNICODES.KING;
        break;

      default:
        break;
    }

    /* switch (this.type) {
      case PieceEnum.Pawn:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.PAWN;
        else this.unicode = BLACK_PIECE_UNICODES.PAWN;
        break;

      case PieceEnum.Knight:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.KNIGHT;
        else this.unicode = BLACK_PIECE_UNICODES.KNIGHT;
        break;

      case PieceEnum.Bishop:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.BISHOP;
        else this.unicode = BLACK_PIECE_UNICODES.BISHOP;
        break;

      case PieceEnum.Rook:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.ROOK;
        else this.unicode = BLACK_PIECE_UNICODES.ROOK;
        break;

      case PieceEnum.Queen:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.QUEEN;
        else this.unicode = BLACK_PIECE_UNICODES.QUEEN;
        break;

      case PieceEnum.King:
        if (this.props.isWhite) this.unicode = WHITE_PIECE_UNICODES.KING;
        else this.unicode = BLACK_PIECE_UNICODES.KING;
        break;

      default:
        break;
    } */
  }
}
