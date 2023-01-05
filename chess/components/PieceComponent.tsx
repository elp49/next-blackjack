import styles from '../../styles/chess.module.css';
import Piece from '../classes/Piece';

export type PieceProps = {
  piece: Piece;
};

function PieceComponent({ piece }: PieceProps): JSX.Element {
  return (
    <div
      className={styles.piece}
      style={{
        backgroundImage: `url(/images/chess/${piece.IsWhite ? 'white' : 'black'}-${piece.Type}.png)`,
      }}
    ></div>
  );
  // return <div className={`${styles.piece} ${piece.IsWhite ? styles.white : styles.black}`}>{piece.Type}</div>;
}

export default PieceComponent;
