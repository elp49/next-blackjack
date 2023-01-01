import { IPieceProps, Piece } from './Piece';

interface IPawnProps extends IPieceProps {}

class Pawn extends Piece {
  constructor(props: IPawnProps) {
    super(props);
  }
}
