import { TilePosition } from '../components/BoardComponent';
import { Piece } from './Piece';

interface ITileProps {
  position: TilePosition;
}

export class Tile {
  private props: ITileProps;
  private piece: Piece; // Piece also has Tile reference

  public get Id(): string {
    return `tile-${this.Position.x}-${this.Position.y}`;
  }
  public get Position(): TilePosition {
    return this.props.position;
  }
  public get Piece(): Piece {
    return this.piece;
  }

  constructor(props: ITileProps) {
    this.props = props;
    this.piece = null;
  }

  public popPiece(): Piece {
    const piece = this.piece;
    this.piece = null;
    // piece.popTile();
    return piece;
  }

  public setPiece(piece: Piece): void {
    // piece.setTile(this);
    this.piece = piece;
  }

  public toString(): string {
    return `Tile.toString(): {position:{x:${this.Position.x}, y:${this.Position.y}}, piece:${this.Piece}}`;
  }
}
