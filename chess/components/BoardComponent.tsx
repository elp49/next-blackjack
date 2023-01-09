import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import { Button } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import Prompt from '../../components/Prompt';
import { BOARD_LENGTH } from '../../pages/chess';
import styles from '../../styles/chess.module.css';
import { getRandomInt, log } from '../../utils/utils';
import Piece, { PieceEnum } from '../classes/Piece';
import Tile from '../classes/Tile';
import PieceComponent from './PieceComponent';
import TileComponent from './TileComponent';

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

function getTile({ x, y }: TilePosition, tiles: Tile[], xAxis: string[], yAxis: number[]) {
  let tile: Tile;
  const iRow = yAxis.indexOf(y);
  const iCol = xAxis.indexOf(x);
  if (iRow !== -1 && iCol !== -1) {
    tile = tiles[iRow * BOARD_LENGTH + iCol];
  }
  return tile;
}

function getValidTiles(
  piece: Piece,
  tiles: Tile[],
  isPlayerWhite: boolean,
  xAxis: string[],
  yAxis: number[],
  canCastle: boolean,
  allowPutKingInCheck: boolean = false
) {
  // log(`getting valid tiles for piece type: ${piece.Type}`);
  let iValidTiles: number[] = [];
  const { x, y } = piece.Tile.Position;

  const calculateValidTiles = (xChange: number, yChange: number, continueUntilBlocked: boolean = true) => {
    // log('calculating Valid Tiles');
    let xIndex = xAxis.indexOf(x);
    let yIndex = yAxis.indexOf(y);

    const evaluate = (position: TilePosition): boolean => {
      let continueEvaluating = false;
      const nextTile = getTile(position, tiles, xAxis, yAxis);
      if (nextTile) {
        // empty tile or the piece on that tile is not the players
        if (!nextTile.Piece || nextTile.Piece.IsWhite !== piece.IsWhite) {
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
    } while (evaluate({ x: xAxis[xIndex], y: yAxis[yIndex] }) && continueUntilBlocked);

    // log(`iValidTiles: [${iValidTiles.join(', ')}].length = ${iValidTiles.length}`);
  };

  switch (piece.Type) {
    case PieceEnum.Pawn:
      // log(`case PieceEnum.Pawn:`);

      const STARTING_PAWN_Y_AXIS = (isPieceWhite: boolean) => {
        if (isPieceWhite) return 2;
        else return 7;
      };

      // log(`position: (${x},${y})`);
      const yChange = piece.IsPlayersPiece(isPlayerWhite) ? -1 : 1; // pawn direction
      // log(`IsPlayersPiece: (${piece.IsPlayersPiece(isPlayerWhite)})`);
      // log(`yChange: (${yChange})`);
      const yIndex = yAxis.indexOf(y);
      const tile = getTile({ x, y: yAxis[yIndex + yChange] }, tiles, xAxis, yAxis);
      // log(`tile: (${tile})`);

      // pawns cant take another piece head on
      if (tile && !tile.Piece) {
        // log(`tile && !tile.Piece`);
        iValidTiles.push(tile.Index); // up one

        // log(
        //   `y === STARTING_PAWN_Y_AXIS(piece.IsWhite:${piece.IsWhite}, isPlayerWhite:${isPlayerWhite})`
        // );
        if (y === STARTING_PAWN_Y_AXIS(piece.IsWhite)) {
          const tile = getTile({ x, y: yAxis[yIndex + yChange * 2] }, tiles, xAxis, yAxis);
          if (tile && !tile.Piece) {
            iValidTiles.push(tile.Index); // up two
          }
        }
      }

      // pawn takes pieces diagonally
      const xIndex = xAxis.indexOf(x);
      [-1, 1].forEach((xChange) => {
        // log(`[-1, 1].forEach((${xChange}) => {`);
        const tile = getTile({ x: xAxis[xIndex + xChange], y: yAxis[yIndex + yChange] }, tiles, xAxis, yAxis);
        // pawns can only move diagonal forward while taking another piece
        if (tile && tile.Piece && tile.Piece.IsWhite !== piece.IsWhite) {
          iValidTiles.push(tile.Index);
        }
      });
      break;

    case PieceEnum.Knight:
      // log(`case PieceEnum.Knight:`);
      knightMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange, false));
      break;

    case PieceEnum.Bishop:
      // log(`case PieceEnum.Bishop:`);
      bishopMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange));
      break;

    case PieceEnum.Rook:
      // log(`case PieceEnum.Rook:`);
      rookMutations.forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange));
      break;

    case PieceEnum.Queen:
      // log(`case PieceEnum.Queen:`);
      bishopMutations.concat(rookMutations).forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange));
      break;

    case PieceEnum.King:
      // log(`case PieceEnum.King:`);
      bishopMutations
        .concat(rookMutations)
        .forEach(({ xChange, yChange }) => calculateValidTiles(xChange, yChange, false));

      // log(`canCastle: ${canCastle}`);
      if (canCastle) {
        const { I_WHITE_ROOK_1, I_WHITE_ROOK_2, I_WHITE_KING, I_BLACK_ROOK_1, I_BLACK_ROOK_2, I_BLACK_KING } =
          getTileIndices(isPlayerWhite);

        // confirm no pieces in the way
        const isClearToCastle = (iStart, iStop) => {
          let i = iStart + 1;
          do {
            if (tiles[i].Piece) return false;
            i++;
          } while (i < iStop);
          return true;
        };

        if (piece.IsWhite) {
          if (isClearToCastle(I_WHITE_ROOK_1, I_WHITE_KING)) {
            // log(`white is clear to castle left`);
            iValidTiles.push(I_WHITE_ROOK_1);
            iValidTiles.push(I_WHITE_KING - 2);
          }
          // else log(`white is NOT clear to castle left`);
          if (isClearToCastle(I_WHITE_KING, I_WHITE_ROOK_2)) {
            // log(`white is clear to castle right`);
            iValidTiles.push(I_WHITE_ROOK_2);
            iValidTiles.push(I_WHITE_KING + 2);
          }
          // else log(`white is NOT clear to castle right`);
        } else {
          if (isClearToCastle(I_BLACK_ROOK_1, I_BLACK_KING)) {
            // log(`black is clear to castle left`);
            iValidTiles.push(I_BLACK_ROOK_1);
            iValidTiles.push(I_BLACK_KING - 2);
          }
          // else log(`black is NOT clear to castle left`);
          if (isClearToCastle(I_BLACK_KING, I_BLACK_ROOK_2)) {
            // log(`black is clear to castle right`);
            iValidTiles.push(I_BLACK_ROOK_2);
            iValidTiles.push(I_BLACK_KING + 2);
          }
          // else log(`black is NOT clear to castle right`);
        }
      }
      break;

    default:
      log(`default:`);
      break;
  }

  if (!allowPutKingInCheck) {
    // log(
    //   `before test king in check for  ${piece.Type} on tile ${piece.Tile.Index} - iValidTiles: [${iValidTiles.join(
    //     ', '
    //   )}].length = ${iValidTiles.length}`
    // );
    // log('disallowing check');
    iValidTiles = iValidTiles.filter((i) => {
      // simulate moving piece on tempory tiles
      // log(`simulate moving ${piece.IsWhite ? 'white' : 'black'} ${piece.Type} to tile ${i}`);
      const tempTiles = tiles.map((x) => x.clone());
      const tempPiece = tempTiles[piece.Tile.Index].popPiece();
      tempPiece.setTile(tempTiles[i]);
      //
      return !testDoesMoveMakeCheck(piece.IsWhite, tempTiles, xAxis, yAxis, isPlayerWhite, canCastle);
    });
    // log(
    //   `after test king in check for  ${piece.Type} on tile ${piece.Tile.Index} - iValidTiles: [${iValidTiles.join(
    //     ', '
    //   )}].length = ${iValidTiles.length}`
    // );
  } else {
    // log(
    //   `no test for  ${piece.Type} on tile ${piece.Tile.Index} - iValidTiles: [${iValidTiles.join(', ')}].length = ${
    //     iValidTiles.length
    //   }`
    // );
  }

  return iValidTiles;
}

const testDoesMoveMakeCheck = (
  isTestOnWhite: boolean,
  tiles: Tile[],
  xAxis: string[],
  yAxis: number[],
  isPlayerWhite: boolean,
  canCastle: boolean
): boolean => {
  for (let i = 0; i < tiles.length; i++) {
    const pieceToMove = tiles[i].Piece;
    // for each tile with a piece
    if (pieceToMove && pieceToMove.IsWhite !== isTestOnWhite) {
      // for each tile with a piece on it thats not the piece we just temporarily moved
      // if (x.Piece && x.Piece.Tile.Index !== iTo) {
      const iValidTiles = getValidTiles(pieceToMove, tiles, isPlayerWhite, xAxis, yAxis, canCastle, true);
      // for each potential move that any tile could make
      for (let j = 0; j < iValidTiles.length; j++) {
        const t = tiles[iValidTiles[j]];
        // if the potential new tile contains a king of same color to test
        if (t.Piece && t.Piece.Type === PieceEnum.King) {
          // log('/* ****************************************************** |');
          // log('/*                                                        |');
          // log(`/*  potential new tile ${iValidTiles[j]} contains a king  |`);
          // log('/*                                                        |');
          // log('/* ______________________________________________________ |');
          // log(`test is on ${isTestOnWhite ? 'white' : 'black'}`);
          // log(`t.Piece is a ${t.Piece.IsWhite ? 'white' : 'black'} ${t.Piece.Type}`);
          // log(`pieceToMove  -  ${pieceToMove.IsWhite ? 'white' : 'black'} ${pieceToMove.Type} on tile ${i}`);
          // log(`potential new tile ${iValidTiles[j]} contains a king`);
          // return tile of piece that will put king in check
          return true;
        }
      }
    }
  }

  return false;
};

export type TilePosition = {
  x: string;
  y: number;
};

type Move = {
  iFrom: number;
  iTo: number;
};
type PieceMoved = Move & {
  wasPieceTaken: boolean;
  didCastleKing: boolean;
  doesMoveMakeCheck: boolean;
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

type BoardComponentProps = {
  isPlayerWhite: boolean;
  xAxis: string[];
  yAxis: number[];
  isDebugMode?: boolean;
};

/* const I_WHITE_ROOK_1 = isPlayerWhite ? 56 : 0;
  const I_WHITE_ROOK_2 = isPlayerWhite ? 63 : 7;
  const I_WHITE_KING = isPlayerWhite ? 60 : 3;

  const I_BLACK_ROOK_1 = isPlayerWhite ? 0 : 56;
  const I_BLACK_ROOK_2 = isPlayerWhite ? 7 : 63;
  const I_BLACK_KING = isPlayerWhite ? 4 : 59; */

function getTileIndices(isPlayerWhite: boolean) {
  return {
    I_WHITE_ROOK_1: isPlayerWhite ? 56 : 0,
    I_WHITE_ROOK_2: isPlayerWhite ? 63 : 7,
    I_WHITE_KING: isPlayerWhite ? 60 : 3,

    I_BLACK_ROOK_1: isPlayerWhite ? 0 : 56,
    I_BLACK_ROOK_2: isPlayerWhite ? 7 : 63,
    I_BLACK_KING: isPlayerWhite ? 4 : 59,
  };
}

function BoardComponent({ isPlayerWhite, xAxis, yAxis, isDebugMode = false }: BoardComponentProps): JSX.Element {
  const [isPlayersTurn, setIsPlayersTurn] = useState<boolean>(false);

  const [didBlackCastle, setDidBlackCastle] = useState<boolean>(false);
  const [didWhiteCastle, setDidWhiteCastle] = useState<boolean>(false);

  const [isBlackInCheck, setIsBlackInCheck] = useState<boolean>(false);
  const [isWhiteInCheck, setIsWhiteInCheck] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [disposedPieces, setDisposedPieces] = useState<Piece[]>([]);

  const [previousMoves, setPreviousMoves] = useState<PieceMoved[]>([]);
  const undo = () => {
    const newTiles = [...tiles];
    const newPreviousMoves = [...previousMoves];
    const newDisposedPieces = [...disposedPieces];

    const undoMove = (isPlayer: boolean) => {
      const { iFrom, iTo, wasPieceTaken, didCastleKing, doesMoveMakeCheck } = newPreviousMoves.pop();
      log(`popped ${isPlayer ? 'player' : 'opponent'} move {iFrom:${iFrom}, iTo:${iTo}}`);
      const movedPiece = newTiles[iTo].popPiece();
      movedPiece.setTile(newTiles[iFrom]);
      if (wasPieceTaken) {
        const resurrectedPiece = newDisposedPieces.pop();
        resurrectedPiece.setTile(newTiles[iTo]);
      } else if (didCastleKing) {
        if (iTo < iFrom) {
          const movedRook = newTiles[iTo + 1].popPiece();
          if (isPlayerWhite) {
            movedRook.setTile(newTiles[iTo - 2]);
          } else {
            movedRook.setTile(newTiles[iTo - 1]);
          }
        } else {
          const movedRook = newTiles[iTo - 1].popPiece();
          if (isPlayerWhite) {
            movedRook.setTile(newTiles[iTo + 1]);
          } else {
            movedRook.setTile(newTiles[iTo + 2]);
          }
        }

        if (movedPiece.IsWhite) {
          log(`setDidWhiteCastle(false);`);
          setDidWhiteCastle(false);
        } else {
          log(`setDidBlackCastle(false);`);
          setDidBlackCastle(false);
        }
      }

      if (doesMoveMakeCheck) {
        const prevPrevMove = newPreviousMoves[newPreviousMoves.length - 1];
        const prevPrevMovedPiece = newTiles[prevPrevMove.iTo].Piece;
        if (prevPrevMovedPiece.IsWhite) {
          setIsBlackInCheck(prevPrevMove.doesMoveMakeCheck);
        } else {
          setIsWhiteInCheck(prevPrevMove.doesMoveMakeCheck);
        }
      }
    };

    if (isDebugMode) {
      undoMove(!isPlayersTurn);
      if (isPlayersTurn) {
        setIsPlayersTurn(false);
      } else {
        setIsPlayersTurn(true);
      }
    } else {
      undoMove(false); // undo opponent move
      undoMove(true); // undo player move
    }

    setValidTiles([]);
    setActivePiece(null);
    setTiles(newTiles);
    setPreviousMoves(newPreviousMoves);
    setDisposedPieces(newDisposedPieces);
  };

  const [activePiece, setActivePiece] = useState<Piece>(null);
  const [iValidTiles, setValidTiles] = useState<number[]>([]);
  const [iImmovablePiece, setImmovablePiece] = useState<number>(-1);

  /*
   *
   *
   *
   *
   *
   *
   *
   */

  // cannot castle if moved both rooks or king
  const canCastle = useCallback(
    (isWhite: boolean) => {
      let canCastle = isWhite ? !didWhiteCastle && !isWhiteInCheck : !didBlackCastle && !isBlackInCheck;
      // log(
      //   `initial canCastle: ${canCastle} = isWhite:${isWhite} ? !didWhiteCastle:${!didWhiteCastle} && !isWhiteInCheck:${!isWhiteInCheck} : !didBlackCastle:${!didBlackCastle} && !isBlackInCheck:${!isBlackInCheck}`
      // );

      if (canCastle) {
        const { I_WHITE_ROOK_1, I_WHITE_ROOK_2, I_WHITE_KING, I_BLACK_ROOK_1, I_BLACK_ROOK_2, I_BLACK_KING } =
          getTileIndices(isPlayerWhite);
        let iRook1 = isWhite ? I_WHITE_ROOK_1 : I_BLACK_ROOK_1;
        let iRook2 = isWhite ? I_WHITE_ROOK_2 : I_BLACK_ROOK_2;
        let iKing = isWhite ? I_WHITE_KING : I_BLACK_KING;

        let movedRook1,
          movedRook2 = false;

        for (let i = 0; i < previousMoves.length; i++) {
          const { iFrom } = previousMoves[i];

          if (!movedRook1 && iFrom === iRook1) {
            movedRook1 = true;
          } else if (!movedRook2 && iFrom === iRook2) {
            movedRook2 = true;
          }

          if (iFrom === iKing || (movedRook1 && movedRook2)) {
            // log(`canCastle  -  breaking: ${iFrom} === ${iKing} || (movedRook1 && movedRook2)`);
            canCastle = false;
            break;
          }
        }
      }

      return canCastle;
    },
    [didBlackCastle, didWhiteCastle, isBlackInCheck, isPlayerWhite, isWhiteInCheck, previousMoves]
  );

  const movePiece = useCallback(
    ({ iFrom, iTo }: Move) => {
      const newTiles = [...tiles];
      const newPreviousMove: PieceMoved = {
        iFrom,
        iTo,
        wasPieceTaken: false,
        didCastleKing: false,
        doesMoveMakeCheck: false,
      };
      log('/* ************************************************ |');
      log('/*                                                  |');
      log('/*                 moving piece                     |');
      log('/*                                                  |');
      log('/* ________________________________________________ |');

      // new tile is empty or the piece on that tile doesnt belong to same player as other piece
      const iFromPiece = newTiles[iFrom].Piece;
      if (iTo !== iFrom && iFromPiece) {
        const isMoveCastle =
          canCastle(iFromPiece.IsWhite) &&
          iFromPiece.Type === PieceEnum.King &&
          Math.abs(xAxis.indexOf(tiles[iFrom].Position.x) - xAxis.indexOf(tiles[iTo].Position.x)) > 1;
        if (!isMoveCastle) {
          // dispose taken piece
          const wasPieceTaken = newTiles[iTo].Piece ? true : false;
          if (wasPieceTaken) {
            const disposed = newTiles[iTo].popPiece();
            setDisposedPieces([...disposedPieces, disposed]);

            newPreviousMove.wasPieceTaken = true;
          }

          // move piece
          const piece = newTiles[iFrom].popPiece();
          piece.setTile(newTiles[iTo]);

          // log(
          //   `moving a ${newTiles[iFrom].Piece.Type},  wasPieceTaken: ${wasPieceTaken}  ${
          //     wasPieceTaken && `it was a ${newTiles[iTo].Piece.Type}`
          //   }`
          // );
        }

        // for castling
        else {
          const castleKing = (iRook) => {
            const xChange = iRook < iFrom ? -1 : 1;
            const iKing = iFrom + 2 * xChange;

            const king = newTiles[iFrom].popPiece();
            const rook = newTiles[iRook].popPiece();
            king.setTile(newTiles[iKing]);
            rook.setTile(newTiles[iFrom + xChange]);

            newPreviousMove.iTo = iKing;
            newPreviousMove.didCastleKing = true;
          };

          // castle
          const { I_WHITE_ROOK_1, I_WHITE_ROOK_2, I_WHITE_KING, I_BLACK_ROOK_1, I_BLACK_ROOK_2, I_BLACK_KING } =
            getTileIndices(isPlayerWhite);
          if (iFromPiece.IsWhite && !didWhiteCastle) {
            castleKing(iTo < iFrom ? I_WHITE_ROOK_1 : I_WHITE_ROOK_2);
            setDidWhiteCastle(true);
          } else if (!iFromPiece.IsWhite && !didBlackCastle) {
            castleKing(iTo < iFrom ? I_BLACK_ROOK_1 : I_BLACK_ROOK_2);
            setDidBlackCastle(true);
          }
        }

        // newTiles.forEach((x, i) => {
        //   log(`#${i}: ${x.Piece && `piece: ${x.Piece.Type}`}`);
        // });
        log('testing if move does make check');
        if (testDoesMoveMakeCheck(!iFromPiece.IsWhite, newTiles, xAxis, yAxis, isPlayerWhite, false)) {
          log(`it does...`);
          if (iFromPiece.IsWhite) {
            log('setting black in check');
            setIsBlackInCheck(true);
          } else {
            log('setting white in check');
            setIsWhiteInCheck(true);
          }

          newPreviousMove.doesMoveMakeCheck = true;
        }

        setTiles(newTiles);
        setPreviousMoves([...previousMoves, newPreviousMove]);
      }
    },
    [canCastle, didBlackCastle, didWhiteCastle, disposedPieces, isPlayerWhite, previousMoves, tiles, xAxis, yAxis]
  );

  useEffect(() => {
    if (isBlackInCheck) {
      log('black is in check');
    }
    if (isWhiteInCheck) {
      log('white is in check');
    }
  }, [isBlackInCheck, isWhiteInCheck]);

  /*
  \****************************************************\
  \*                                                  *\
  \*                 ON TILE CLICK                    *\
  \*                                                  *\
  \****************************************************\
  */

  const onTileClick = (tile: Tile): void => {
    log(`onTileClick(tile:${tile}),  {activePiece: ${activePiece}}`);
    if (isPlayersTurn || isDebugMode) {
      // move piece to new tile
      if (
        activePiece &&
        // (!tile.Piece || tile.Piece.IsWhite !== activePiece.IsWhite) &&
        ((activePiece.Tile.Index !== iImmovablePiece && iValidTiles.includes(tile.Index)) || isDebugMode)
      ) {
        // log('activePiece !== null && !isImmovable');
        movePiece({ iFrom: activePiece.Tile.Index, iTo: tile.Index });
        setActivePiece(null);
        setIsPlayersTurn(!isPlayersTurn);
      }

      // set new active piece
      else if (activePiece && activePiece.Tile.Index === tile.Index) {
        setActivePiece(null);
      }

      // same piece selected
      else {
        // log('activePiece === null || isImmovable');
        setActivePiece(tile.Piece);
      }

      setValidTiles([]);
      setImmovablePiece(-1);
    } else {
      log('???? but its not the players turn ????');
    }
  };

  useEffect(() => {
    /******
     * New active piece - update current valid tiles
     */
    if (activePiece) {
      log('new active piece, getting valid tiles');
      const castle = canCastle(activePiece.IsWhite);
      // log(
      //   `activePiece is ${activePiece.IsWhite ? 'white' : 'black'} ${activePiece.Type} and owner of piece ${
      //     castle ? 'can' : 'cannot'
      //   } castle`
      // );
      const newValidTiles = getValidTiles(activePiece, tiles, isPlayerWhite, xAxis, yAxis, castle);
      log(`newValidTiles: [${newValidTiles.join(', ')}].length = ${newValidTiles.length}`);
      setValidTiles(newValidTiles);

      if (newValidTiles.length === 0) {
        setImmovablePiece(activePiece.Tile.Index);
        if (!isDebugMode) {
          setActivePiece(null);
        }
      }
    }

    // opponent plays
    else if (!isPlayersTurn && !isDebugMode) {
      log('opponent plays.');
      const opponentPieces: Tile[] = tiles.filter((x) => x.Piece && !x.Piece.IsPlayersPiece(isPlayerWhite));
      const castle = canCastle(!isPlayerWhite);
      log(`opponent iValidTiles = [`);
      const iValidTiles: number[][] = opponentPieces.map((tile, i) => {
        const valid = getValidTiles(tile.Piece, tiles, isPlayerWhite, xAxis, yAxis, castle);
        log(`${i}, ${tile.Piece.Type}  - [${valid.join(', ')}],`);
        return valid;
      });
      log(`]`);

      if (iValidTiles.some((x) => x.length > 0)) {
        // get random piece to move
        let iRandPiece: number;
        do {
          iRandPiece = getRandomInt(1, opponentPieces.length) - 1;
        } while (iValidTiles[iRandPiece].length === 0);
        const iRandValidTile: number = getRandomInt(1, iValidTiles[iRandPiece].length) - 1;
        // log(`   ===  =  =  random piece is opponent ${opponentPieces[iRandPiece].Piece.Type}`);
        // log(
        //   `   ===  =  =  random valid tile: ${iRandValidTile} of available valids  -  [${iValidTiles[iRandPiece].join(
        //     ', '
        //   )}]`
        // );

        const move: Move = { iFrom: opponentPieces[iRandPiece].Index, iTo: iValidTiles[iRandPiece][iRandValidTile] };
        log(`moving opponent piece,  move: {iFrom :${move.iFrom}, iTo :${move.iTo}}`);
        movePiece(move);
        log('/* ************************************************ |');
        log('/*                                                  |');
        log('/*                opponent moved                    |');
        log('/*                                                  |');
        log('/* ________________________________________________ |');
      }

      // end game
      else if (previousMoves.length > 0) {
        log('/* ************************************************ |');
        log('/*                                                  |');
        log('/*                   GAME OVERRR                    |');
        log('/*                                                  |');
        log('/* ________________________________________________ |');
        setIsGameOver(true);
      }

      setIsPlayersTurn(true);
    }
  }, [
    activePiece,
    canCastle,
    didBlackCastle,
    didWhiteCastle,
    isBlackInCheck,
    isDebugMode,
    isPlayerWhite,
    isPlayersTurn,
    isWhiteInCheck,
    movePiece,
    previousMoves.length,
    tiles,
    xAxis,
    yAxis,
  ]);

  /*
   *
   *
   *
   *
   *
   *
   *
   */

  const setDefaultBoard = useCallback(() => {
    log(`setDefaultBoard - isPlayerWhite:${isPlayerWhite}`);
    const tiles: Tile[] = [];

    yAxis.forEach((y, iRow) => {
      xAxis.forEach((x, iCol) => {
        const tile = new Tile({ position: { x, y }, index: iRow * BOARD_LENGTH + iCol });

        if (iRow <= 1) {
          new Piece({ isWhite: !isPlayerWhite, type: getPieceType(iRow, iCol, isPlayerWhite), tile });
        } else if (iRow >= 6) {
          new Piece({ isWhite: isPlayerWhite, type: getPieceType(iRow, iCol, isPlayerWhite), tile });
        }

        tiles.push(tile);
      });
    });

    setTiles(tiles);
  }, [isPlayerWhite, xAxis, yAxis]);

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

  const restart = (accepted: boolean) => {
    setIsGameOver(false);
    if (accepted) resetBoard();
  };
  const resetBoard = useCallback(() => {
    // if (reset) {
    log('/* ************************************************ |');
    log('/*                                                  |');
    log('/*                     reset                        |');
    log('/*                                                  |');
    log('/* ________________________________________________ |');

    setDefaultBoard();

    log(`setIsPlayersTurn(isPlayerWhite:${isPlayerWhite})`);
    log(`isPlayersTurn:${isPlayerWhite})`);
    setIsPlayersTurn(isPlayerWhite);

    setDidWhiteCastle(false);
    setDidBlackCastle(false);

    setIsWhiteInCheck(false);
    setIsBlackInCheck(false);

    setActivePiece(null);
    setValidTiles([]);

    setImmovablePiece(-1);

    setDisposedPieces([]);
    setPreviousMoves([]);
  }, [isPlayerWhite, setDefaultBoard]);

  useEffect(() => {
    log('componentDidMount');
    log('props loaded');
    resetBoard();
  }, [resetBoard]);

  return (
    <div className="column">
      <Prompt promptText={'GAME OVER'} respond={restart} isPromptActive={isGameOver} />
      <div className={`row ${styles.disposed}`}>
        {disposedPieces
          .filter((x) => x.IsPlayersPiece(isPlayerWhite))
          .map((x, i) => (
            <div key={`disposed-player-piece-${i}`} className={styles.piece}>
              <PieceComponent piece={x} />
            </div>
          ))}
      </div>

      <div id="board" className={styles.board}>
        {tiles.map((tile, i) => (
          <TileComponent
            key={tile.Id}
            tile={tile}
            onClick={onTileClick}
            valid={iValidTiles.includes(i)}
            immovable={i === iImmovablePiece}
            isDebugMode={isDebugMode}
          />
        ))}
      </div>
      <div className={`row ${styles.disposed}`}>
        {disposedPieces
          .filter((x) => !x.IsPlayersPiece(isPlayerWhite))
          .map((x, i) => (
            <div key={`disposed-opponent-piece-${i}`} className={styles.piece}>
              <PieceComponent piece={x} />
            </div>
          ))}
      </div>
      <div id="bottom" className="row" style={{ width: '100%' }}>
        <div className="third row"></div>
        <div className="third row">
          <Button onClick={undo} disabled={previousMoves.length === 0} style={{ padding: 0, minWidth: '1em' }}>
            <UndoIcon color="action" style={{ fontSize: '3rem' }} />
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
