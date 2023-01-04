import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RedoIcon from '@mui/icons-material/Redo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import { Button } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { BOARD_LENGTH } from '../../pages/chess';
import styles from '../../styles/chess.module.css';
import { getRandomInt } from '../../utils/utils';
import Piece, { PieceEnum } from '../classes/Piece';
import Tile from '../classes/Tile';
import PieceComponent from './PieceComponent';
import TileComponent from './TileComponent';

export type TilePosition = {
  x: string;
  y: number;
};

type PieceMoved = {
  iFrom: number;
  iTo: number;
  wasPieceTaken: boolean;
};

const knightMutations = [
  { xChange: -1, yChange: -2 },
  { xChange: 1, yChange: -2 },
  { xChange: 2, yChange: -1 },
  { xChange: 2, yChange: 1 },
  { xChange: 1, yChange: 2 },
  { xChange: -1, yChange: 2 },
  { xChange: -2, yChange: 1 },
  { xChange: -2, yChange: -1 },
];
const bishopMutations = [
  { xChange: -1, yChange: -1 },
  { xChange: 1, yChange: -1 },
  { xChange: 1, yChange: 1 },
  { xChange: -1, yChange: 1 },
];
const rookMutations = [
  { xChange: 0, yChange: -1 },
  { xChange: 1, yChange: 0 },
  { xChange: 0, yChange: 1 },
  { xChange: -1, yChange: 0 },
];

const getPieceType = (iRow: number, iCol: number, isPlayerWhite: boolean): PieceEnum => {
  let type: PieceEnum;

  if (iRow === 1 || iRow === 6) {
    type = PieceEnum.Pawn;
  } else {
    switch (iCol) {
      case 0:
      case 7:
        type = PieceEnum.Rook;
        break;

      case 1:
      case 6:
        type = PieceEnum.Knight;
        break;

      case 2:
      case 5:
        type = PieceEnum.Bishop;
        break;

      case 3:
        if (isPlayerWhite) type = PieceEnum.Queen;
        else type = PieceEnum.King;
        break;

      case 4:
        if (isPlayerWhite) type = PieceEnum.King;
        else type = PieceEnum.Queen;
        break;

      default:
        break;
    }
  }

  return type;
};

/*
 *
 *
 *
 *
 *
 *
 *
 */

export const isPositionEqual = (a: TilePosition, b: TilePosition) => a.x === b.x && a.y === b.y;

type BoardComponentProps = {
  isPlayerWhite: boolean;
  xAxis: string[];
  yAxis: number[];
  isDebugMode?: boolean;
};

function BoardComponent({ isPlayerWhite, xAxis, yAxis, isDebugMode = false }: BoardComponentProps): JSX.Element {
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);
  const pauseGame = () => setIsGamePaused(true);
  const resumeGame = () => setIsGamePaused(false);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [disposedPieces, setDisposedPieces] = useState<Piece[]>([]);

  const [previousMoves, setPreviousMoves] = useState<PieceMoved[]>([]);
  const undo = () => {
    const newTiles = [...tiles];
    const newPreviousMoves = [...previousMoves];
    const newDisposedPieces = [...disposedPieces];

    [false, true].forEach((isPlayer) => {
      const { iFrom, iTo, wasPieceTaken } = newPreviousMoves.pop();
      console.log(`popped ${isPlayer ? 'player' : 'opponent'} move {iFrom:${iFrom}, iTo:${iTo}}`);
      const movedPiece = newTiles[iTo].popPiece();
      movedPiece.setTile(newTiles[iFrom]);
      if (wasPieceTaken) {
        const resurrectedPiece = newDisposedPieces.pop();
        resurrectedPiece.setTile(newTiles[iTo]);
      }
    });

    setTiles(newTiles);
    setPreviousMoves(newPreviousMoves);
    setDisposedPieces(newDisposedPieces);
  };
  const redo = () => {};

  const [activePiece, setActivePiece] = useState<Piece>(null);
  const [iValidTiles, setValidTiles] = useState<number[]>([]);
  const [iImmovablePiece, setImmovablePiece] = useState<number>(-1);

  const getTile = useCallback(
    ({ x, y }: TilePosition): Tile => {
      let tile: Tile;
      const iRow = yAxis.indexOf(y);
      const iCol = xAxis.indexOf(x);
      if (iRow !== -1 && iCol !== -1) {
        tile = tiles[iRow * BOARD_LENGTH + iCol];
      }
      return tile;
    },
    [xAxis, yAxis, tiles]
  );

  /*
   *
   *
   *
   *
   *
   *
   *
   */

  const movePiece = (newTile: Tile) => {
    console.log();
    console.log();
    console.log(`  - movePiece`);
    // TILE_POSITIONS[yNew][x];
    let didMove = false;

    // new tile is empty or the piece on that tile doesnt belong to same player as other piece
    if (
      (!newTile.Piece || activePiece.IsWhite !== newTile.Piece.IsWhite) &&
      newTile.Index !== activePiece.Tile.Index &&
      (isDebugMode || iValidTiles.includes(newTile.Index))
    ) {
      console.log(`!newTile.Piece || activePiece.IsWhite !== newTile.Piece.IsWhite`);
      const newTiles = [...tiles];
      const newPreviousMoves = [...previousMoves];
      const newDisposedPieces = [...disposedPieces];

      const moveTakeDispose = (iFrom: number, iTo: number) => {
        const wasPieceTaken = newTiles[iTo].Piece ? true : false;

        // dispose taken piece
        if (wasPieceTaken) {
          const disposed = newTiles[iTo].popPiece();
          newDisposedPieces.push(disposed);
        }

        // move piece
        const piece = newTiles[iFrom].popPiece();
        piece.setTile(newTiles[iTo]);
        console.log(`adding move {iFrom:${iFrom}, iTo:${iTo}}`);
        newPreviousMoves.push({ iFrom, iTo, wasPieceTaken });
      };

      moveTakeDispose(activePiece.Tile.Index, newTile.Index);

      // opponent plays
      const opponentPieces: Tile[] = tiles.filter((x) => x.Piece && !x.Piece.IsPlayersPiece(isPlayerWhite));
      const iValidTiles: number[][] = opponentPieces.map((tile) => getValidTiles(tile.Piece));
      if (iValidTiles.some((x) => x.length > 0)) {
        // get random piece to move
        let iRandPiece: number;
        do {
          iRandPiece = getRandomInt(opponentPieces.length - 1);
          console.log(`iRandPiece: ${iRandPiece}`);
        } while (iValidTiles[iRandPiece].length === 0);
        const iRandValidTile: number = getRandomInt(iValidTiles[iRandPiece].length - 1);

        moveTakeDispose(opponentPieces[iRandPiece].Index, iValidTiles[iRandPiece][iRandValidTile]);
      }

      setTiles(newTiles);
      setPreviousMoves(newPreviousMoves);
      setDisposedPieces(newDisposedPieces);
      didMove = true;
    }

    setActivePiece(null);
    setValidTiles([]);
    setImmovablePiece(-1);
    console.log(`else`);

    return didMove;
  };

  const onTileClick = (tile: Tile): void => {
    console.log(`onTileClick(tile:${tile}),  {activePiece: ${activePiece}}`);

    // move piece to new tile
    if (activePiece && activePiece.Tile.Index !== iImmovablePiece) {
      console.log('activePiece !== null && !isImmovable');
      const didMove = movePiece(tile);
      // setActivePiece(null);
    }

    // set new active piece
    else if (tile.Piece && tile.Piece.IsPlayersPiece(isPlayerWhite)) {
      console.log('activePiece === null || isImmovable');
      setActivePiece(tile.Piece);
      setValidTiles([]);
      setImmovablePiece(-1);
    }
  };

  const getValidTiles = useCallback(
    (piece: Piece): number[] => {
      const iValidTiles: number[] = [];
      const { x, y } = piece.Tile.Position;

      const calculateValidTiles = (xChange: number, yChange: number, continueUntilBlocked: boolean = true) => {
        let nextPosition: TilePosition;
        let xIndex = xAxis.indexOf(x);
        let yIndex = yAxis.indexOf(y);

        const evaluate = (position: TilePosition): boolean => {
          let continueEvaluating = false;
          const nextTile = getTile(position);
          if (nextTile) {
            // empty tile or the piece on that tile is not the players
            if (!nextTile.Piece || nextTile.Piece.IsWhite !== piece.IsWhite) {
              // console.log(` - position: {${position.x}, ${position.y}}`);
              // console.log(` - position: {${nextTile.Position.x}, ${nextTile.Position.y}}`);
              // console.log(`pushing index: ${nextTile.Index}`);
              iValidTiles.push(nextTile.Index);
            }
            // return value: will continue evaluating tiles in this direction?
            continueEvaluating = !nextTile.Piece;
          }
          return continueEvaluating;
        };

        do {
          xIndex += xChange;
          yIndex += yChange;
          nextPosition = { x: xAxis[xIndex], y: yAxis[yIndex] };
        } while (evaluate(nextPosition) && continueUntilBlocked);
      };

      switch (piece.Type) {
        case PieceEnum.Pawn:
          console.log(`case PieceEnum.Pawn:`);

          const STARTING_PAWN_Y_AXIS = (isPieceWhite: boolean) => {
            if (isPieceWhite) return 2;
            else return 7;
          };

          // console.log(`position: (${x},${y})`);
          const yChange = piece.IsPlayersPiece(isPlayerWhite) ? -1 : 1;
          // console.log(`IsPlayersPiece: (${piece.IsPlayersPiece(isPlayerWhite)})`);
          // console.log(`yChange: (${yChange})`);
          const yIndex = yAxis.indexOf(y);
          const tile = getTile({ x, y: yAxis[yIndex + yChange] });
          // console.log(`tile: (${tile})`);

          // pawns cant take another piece head on
          if (tile && !tile.Piece) {
            // console.log(`tile && !tile.Piece`);
            iValidTiles.push(tile.Index); // up one

            // console.log(
            //   `y === STARTING_PAWN_Y_AXIS(piece.IsWhite:${piece.IsWhite}, isPlayerWhite:${isPlayerWhite})`
            // );
            if (y === STARTING_PAWN_Y_AXIS(piece.IsWhite)) {
              const tile = getTile({ x, y: yAxis[yIndex + yChange * 2] });
              if (tile && !tile.Piece) {
                iValidTiles.push(tile.Index); // up two
              }
            }
          }

          // pawn takes pieces diagonally
          const xIndex = xAxis.indexOf(x);
          [-1, 1].forEach((xChange) => {
            // console.log(`[-1, 1].forEach((${xChange}) => {`);
            const tile = getTile({ x: xAxis[xIndex + xChange], y: yAxis[yIndex + yChange] });
            // pawns can only move diagonal forward while taking another piece
            if (tile && tile.Piece && tile.Piece.IsWhite !== piece.IsWhite) {
              iValidTiles.push(tile.Index);
            }
          });
          break;

        case PieceEnum.Knight:
          console.log(`case PieceEnum.Knight:`);
          knightMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange, false));
          break;

        case PieceEnum.Bishop:
          console.log(`case PieceEnum.Bishop:`);
          bishopMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange));
          break;

        case PieceEnum.Rook:
          console.log(`case PieceEnum.Rook:`);
          rookMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange));
          break;

        case PieceEnum.Queen:
          console.log(`case PieceEnum.Queen:`);
          bishopMutations.concat(rookMutations).forEach(({ xChange, yChange }, i) => {
            console.log(`queen mutation #${i}`);

            calculateValidTiles(xChange, yChange);
          });
          break;

        case PieceEnum.King:
          console.log(`case PieceEnum.King:`);
          bishopMutations.concat(rookMutations).forEach(({ xChange, yChange }, i) => {
            calculateValidTiles(xChange, yChange, false);
          });
          break;

        default:
          console.log(`default:`);
          break;
      }

      return iValidTiles;
    },
    [getTile, isPlayerWhite, xAxis, yAxis]
  );

  useEffect(() => {
    if (activePiece) {
      console.log(`activePiece - - - ${activePiece}`);
      const newValidTiles = getValidTiles(activePiece);

      console.log(`newValidTiles:  [${newValidTiles.join(', ')}].length = ${newValidTiles.length}`);
      console.log();
      setValidTiles(newValidTiles);
      const isActivePieceImmovable = newValidTiles.length === 0;
      if (isActivePieceImmovable) {
        setImmovablePiece(activePiece.Tile.Index);
        setActivePiece(null);
      } else {
        setImmovablePiece(-1);
      }
    }
  }, [xAxis, activePiece, getTile, isPlayerWhite, tiles, yAxis, getValidTiles]);

  const setDefaultBoard = useCallback(() => {
    console.log(`setDefaultBoard - isPlayerWhite:${isPlayerWhite}`);
    const tiles: Tile[] = [];

    yAxis.forEach((y, iRow) => {
      // console.log(`tiles.length: ${tiles.length}`);
      xAxis.forEach((x, iCol) => {
        // console.log(`${x},${y}`);
        // let piece: Piece;
        const tile = new Tile({ position: { x, y }, index: iRow * BOARD_LENGTH + iCol });

        // console.log(`x:${position.x}, y:${position.y}`);
        if (iRow <= 1) {
          new Piece({ isWhite: !isPlayerWhite, type: getPieceType(iRow, iCol, isPlayerWhite), tile });
        } else if (iRow >= 6) {
          new Piece({ isWhite: isPlayerWhite, type: getPieceType(iRow, iCol, isPlayerWhite), tile });
        }
        // skip middle tiles

        // console.log(`iTile:${tiles.indexOf(tile)}`);
        // return tile;
        tiles.push(tile);
      });
    });
    // console.log(`tiles.length: ${tiles.length}`);

    setTiles(tiles);
  }, [isPlayerWhite, xAxis, yAxis]);

  // const [reset, setReset] = useState<boolean>(true);
  // const resetBoard = () => setReset(true);

  const resetBoard = useCallback(() => {
    // if (reset) {
    console.log(
      '/* ************************************************ |\n' +
        '/*                                                  |\n' +
        '/*                     reset                        |\n' +
        '/*                                                  |\n' +
        '/* ________________________________________________ |'
    );
    // console.log(`xAxis: [${xAxis.join(', ')}].length = ${xAxis.length}`);
    // console.log(`yAxis: [${yAxis.join(', ')}].length = ${yAxis.length}`);
    // const tiles = createDefaultBoard(isPlayerWhite);

    setDefaultBoard();

    setActivePiece(null);
    setValidTiles([]);
    setImmovablePiece(-1);
    setDisposedPieces([]);
    setPreviousMoves([]);

    setIsGamePaused(false);
    // setReset(false);
    // }
  }, [setDefaultBoard]);

  /*
   *
   *
   *
   *
   *
   *
   *
   */

  /*
  \****************************************************\
  \*                                                  *\
  \*                   BOOTSTRAP                      *\
  \*                                                  *\
  \* create tiles and set pieces in default positions *\
  \*                                                  *\
  \*                                                  *\
  \****************************************************\
  */
  useEffect(() => {
    console.log('componentDidMount');
    console.log('props loaded');
    resetBoard();
  }, [resetBoard]);

  return (
    <div className="column">
      <div className={`row ${styles.disposed}`}>
        {disposedPieces
          .filter((x) => x.IsPlayersPiece(isPlayerWhite))
          .map((x, i) => (
            <PieceComponent key={`disposed-player-piece-${i}`} piece={x} />
          ))}
      </div>

      <div id="board" className={styles.board}>
        {tiles.map((tile, i) => (
          <TileComponent
            key={tile.Id}
            tile={tile}
            onClick={onTileClick}
            valid={iValidTiles.includes(i)}
            // valid={iActivePiece && iValidTiles.includes(i)}
            immovable={i === iImmovablePiece}
          />
        ))}
      </div>
      <div className={`row ${styles.disposed}`}>
        {disposedPieces
          .filter((x) => !x.IsPlayersPiece(isPlayerWhite))
          .map((x, i) => (
            <PieceComponent key={`disposed-opponent-piece-${i}`} piece={x} />
          ))}
      </div>
      <div id="bottom" className="row" style={{ width: '100%' }}>
        <div className="third row"></div>
        <div className="third row">
          <Button onClick={undo} disabled={previousMoves.length === 0} style={{ padding: 0, minWidth: '1em' }}>
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

          <Button onClick={redo} disabled={true} style={{ padding: 0, minWidth: '1em' }}>
            <RedoIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
        <div className="third row">
          <Button onClick={resetBoard} style={{ padding: 0, minWidth: '1em' }}>
            <RestartAltIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BoardComponent;
