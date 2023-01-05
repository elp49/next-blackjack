import React, { useEffect, useState } from 'react';
import { BOARD_LENGTH } from '../../pages/chess';
import styles from '../../styles/chess.module.css';
import Tile from '../classes/Tile';
import PieceComponent from './PieceComponent';

export type TileProps = {
  tile: Tile;
  onClick: (tile: Tile) => void;
  valid: boolean;
  immovable: boolean;
};

function TileComponent({ tile, onClick, valid, immovable }: TileProps): JSX.Element {
  const isWhiteTile = ((tile.Index / BOARD_LENGTH) | 0) % 2 === 0 ? tile.Index % 2 === 0 : tile.Index % 2 === 1;
  // const [highlightColor, setHighlightColor] = useState<string>('');
  const [highlightStyles, setHighlightStyles] = useState<React.CSSProperties>({});

  const clicked = () => {
    // console.log(`from Tile Component:\npiece:${piece}`);
    onClick(tile);
  };

  useEffect(() => {
    if (immovable) {
      // console.log(`Tile #${i} is immovable`);
      setHighlightStyles({
        background: 'radial-gradient(circle, rgba(170,6,6,1) 0%, rgba(253,29,29,1) 50%, rgba(170,6,6,1) 100%)',
      });
      setTimeout(() => {
        // console.log(`highlightColorTimeout, setting null`);
        setHighlightStyles({
          background: '',
        });
      }, 500);
    }
  }, [immovable]);

  return (
    <div id={tile.Id} className={`${styles.tile} ${isWhiteTile ? styles.white : styles.black}`} onClick={clicked}>
      <div className={`column ${styles.tileHighlight}`} style={highlightStyles}>
        {tile.Index % BOARD_LENGTH === 0 && <h1 className={`topLeft ${styles.position}`}>{tile.Position.y}</h1>}
        {tile.Index >= BOARD_LENGTH * (BOARD_LENGTH - 1) && (
          <h1 className={`bottomRight ${styles.position}`}>{tile.Position.x}</h1>
        )}
        {tile.Piece && <PieceComponent piece={tile.Piece} />}
        {valid && (
          <div className={`${styles.validTile} ${tile.Piece ? styles.validTileOccupied : styles.validTileEmpty}`}></div>
        )}
      </div>
    </div>
  );
}

export default TileComponent;
