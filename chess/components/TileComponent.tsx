import styles from '../../styles/chess.module.css';
import { Tile } from '../classes/Tile';
import { X_AXIS_VALUES } from './BoardComponent';

export type TileProps = {
  tile: Tile;
  onClick: (tile: Tile) => void;

  // debug
  i?: number;
};

function TileComponent({ tile, onClick, i }: TileProps): JSX.Element {
  const isWhiteTile = (X_AXIS_VALUES.indexOf(tile.Position.x) + tile.Position.y) % 2 === 0;

  const clicked = () => {
    // console.log(`from Tile Component:\npiece:${piece}`);
    onClick(tile);
  };

  return (
    <div
      id={tile.Id}
      style={{}}
      className={`${styles.tile} ${isWhiteTile ? styles.white : styles.black}`}
      onClick={clicked}
    >
      <div className={styles.tileHighlight}>
        {X_AXIS_VALUES.indexOf(tile.Position.x) === 0 && (
          <h1 className={`topLeft ${styles.position}`}>{tile.Position.y}</h1>
        )}
        {tile.Position.y === 1 && <h1 className={`bottomRight ${styles.position}`}>{tile.Position.x}</h1>}
        {tile.Piece && (
          <div className={`${styles.piece} ${tile.Piece.IsWhite ? styles.white : styles.black}`}>
            {tile.Piece.Unicode}
          </div>
        )}
      </div>
      {/* <span>{i}</span>
      <br />
      <span>
        {tile.Position.x}, {tile.Position.y}
      </span>
      <br />
      <span>{tile.Piece && tile.Piece.Type}</span> */}
    </div>
  );
}

export default TileComponent;
