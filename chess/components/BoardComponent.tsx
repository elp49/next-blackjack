import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RedoIcon from '@mui/icons-material/Redo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '../../styles/chess.module.css';
import { range } from '../../utils/utils';
import { Piece } from '../classes/Piece';
import { Tile } from '../classes/Tile';
import TileComponent from './TileComponent';

const BOARD_LENGTH = 8;

export const X_AXIS_VALUES = 'A B C D E F G H'.split(' ');
const Y_AXIS_VALUES: number[] = range(1, BOARD_LENGTH);

export type TilePosition = {
  x: string;
  y: number;
};

export const TILE_POSITIONS: TilePosition[][] = Array.from(
  {
    length: BOARD_LENGTH,
  },
  (_, k: number) =>
    X_AXIS_VALUES.map((x) => {
      return {
        x,
        y: BOARD_LENGTH - k,
      };
    })
);

export const isPositionEqual = (a: TilePosition, b: TilePosition) => a.x === b.x && a.y === b.y;

const getTileIndex = ({ x, y }: TilePosition): number => (BOARD_LENGTH - y) * BOARD_LENGTH + X_AXIS_VALUES.indexOf(x);

type BoardComponentProps = {
  isPlayerWhite: boolean;
};

function BoardComponent({ isPlayerWhite }: BoardComponentProps): JSX.Element {
  const [isGamePaused, setIsGamePause] = useState<boolean>(false);
  const pauseGame = () => setIsGamePause(true);
  const resumeGame = () => setIsGamePause(false);
  const undo = () => {};
  const redo = () => {};

  const [tiles, setTiles] = useState<Tile[]>([]);

  const [activePiece, setActivePiece] = useState<Piece>(null);

  const movePiece = (current: TilePosition, newPosition: TilePosition) => {
    // TILE_POSITIONS[yNew][x];
    const iNewTile = getTileIndex(newPosition);

    console.log(`iNewTile:${iNewTile}`);
    console.log(`tiles[iNewTile]:${tiles[iNewTile]}`);

    if (!tiles[iNewTile].Piece) {
      const newTiles = [...tiles];

      const iCurrentTile = getTileIndex(current);
      const piece = newTiles[iCurrentTile].popPiece();
      piece.setTile(newTiles[iNewTile]);
      // newTiles[iNewTile].setPiece(piece);

      setTiles(newTiles);
      return true;
    }

    return false;
  };

  const onTileClick = (tile: Tile): void => {
    console.log(`onTileClick(tile:${tile})`);

    // move piece to new tile
    if (activePiece !== null) {
      console.log('else');
      console.log(`${tile.Piece}`);
      console.log(`${typeof tile.Piece}`);
      // needs to be an empty tile to move piece
      if (!tile.Piece) {
        console.log('tile.Piece === null');
        const didMove = movePiece(activePiece.Tile.Position, tile.Position);
      }

      setActivePiece(null);
    }

    // update active piece
    else if (tile.Piece) {
      console.log('activePiece === null');
      console.log(`tile.Piece: {${tile.Piece}}`);
      setActivePiece(tile.Piece);
    }
  };

  const moveForward = (piece: Piece) => {
    let yNew: number;
    let atEndOfBoard = false;
    const { x, y } = piece.Tile.Position;
    if (piece.InitialPosition.y <= 2) {
      if (y < BOARD_LENGTH) yNew = y + 1;
      else atEndOfBoard = true;
    } else {
      if (y > 1) yNew = y - 1;
      else atEndOfBoard = true;
    }

    console.log(`yNew:${yNew}`);

    if (!atEndOfBoard) {
      return movePiece(piece.Tile.Position, { x, y: yNew });
    }

    return false;
  };

  const [reset, setReset] = useState<boolean>(true);
  const resetBoard = () => setReset(true);
  // build tiles with default pieces in beginning positions
  useEffect(() => {
    if (reset) {
      const tiles: Tile[] = [];

      // console.log(`Y_AXIS_VALUES:${Y_AXIS_VALUES}`);

      TILE_POSITIONS.forEach((row, iRow) => {
        row.forEach((position) => {
          // let piece: Piece;
          let tile = new Tile({ position });

          // console.log(`x:${position.x}, y:${position.y}`);
          // skip middle tiles
          if (iRow < 2) {
            new Piece({ isWhite: !isPlayerWhite, tile });
          } else if (iRow > 5) {
            new Piece({ isWhite: isPlayerWhite, tile });
          }

          tiles.push(tile);

          // console.log(`iTile:${tiles.indexOf(tile)}`);
        });
      });

      setTiles(tiles);
      setReset(false);
    }
  }, [isPlayerWhite, reset]);

  return (
    <>
      <div id="board" className={styles.board}>
        {tiles.map((tile, i) => {
          return <TileComponent key={tile.Id} tile={tile} onClick={onTileClick} i={i} />;
        })}
      </div>
      <div id="bottom" className="row" style={{ width: '100%' }}>
        <div className="third row"></div>
        <div className="third row">
          <Button onClick={undo} style={{ padding: 0, minWidth: '1em' }}>
            <UndoIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>

          {isGamePaused ? (
            <Button onClick={resumeGame} style={{ padding: 0, minWidth: '1em' }}>
              <PlayArrowIcon color="action" style={{ fontSize: '3rem' }} />
            </Button>
          ) : (
            <Button onClick={pauseGame} style={{ padding: 0, minWidth: '1em' }}>
              <PauseIcon color="action" style={{ fontSize: '3rem' }} />
            </Button>
          )}

          <Button onClick={redo} style={{ padding: 0, minWidth: '1em' }}>
            <RedoIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
        <div className="third row">
          <Button onClick={resetBoard} style={{ padding: 0, minWidth: '1em' }}>
            <RestartAltIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default BoardComponent;
