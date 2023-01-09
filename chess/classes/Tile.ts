import { TilePosition } from '../components/BoardComponent';
import Piece from './Piece';

interface ITileProps {
  index: number;
  position: TilePosition;
}

class Tile {
  private props: ITileProps;
  private piece: Piece; // Piece also has Tile reference

  public get Id(): string {
    return `tile-${this.props.index}-(${this.props.position.x},${this.props.position.y})`;
  }

  public get Index(): number {
    return this.props.index;
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
    // log(`setPiece - ID: (${this.Id}), piece: (${piece})`);
    this.piece = piece;
  }

  public toString(): string {
    return `Tile.toString(): {position:{x:${this.props.position.x}, y:${this.props.position.y}}, piece:${this.piece}}`;
  }

  public clone(): Tile {
    const clone = new Tile({ ...this.props });
    if (this.piece) {
      clone.piece = this.piece.clone(clone);
    }
    return clone;
  }
}

export default Tile;
