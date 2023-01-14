import { CSSProperties, useEffect, useRef, useState } from 'react';
import styles from '../../styles/snake.module.css';
import { KeyConstants } from '../../utils/keys';
import { log, range } from '../../utils/utils';

const CELLS_PER_ROW = 25;
const CELL_LENGTH_PERCENTAGE = 100 / CELLS_PER_ROW;

type SnakeBoardProps = {
  isDebugMode?: boolean;
};

function SnakeBoard({ isDebugMode }: SnakeBoardProps): JSX.Element {
  const boardRef = useRef<HTMLDivElement>();
  const headRef = useRef<HTMLDivElement>();

  const [boardLength, setBoardLength] = useState<number>(0);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [headTop, setHeadTop] = useState<number>(0);
  const [headLeft, setHeadLeft] = useState<number>(0);
  const [speedVariant, setSpeedVariant] = useState<number>(4);
  const [transitionDuration, setTransitionDuration] = useState<number>(4000);

  type TailInstructions = {
    gotToX: string;
    goToY: string;
    then?: TailInstructions;
  };

  const actionXMap = {
    ArrowLeft: '0%',
    ArrowRight: `${100 - CELL_LENGTH_PERCENTAGE}%`,
  };
  const actionYMap = {
    ArrowDown: `${100 - CELL_LENGTH_PERCENTAGE}%`,
    ArrowUp: '0%',
  };
  function handleKeyPress(e: KeyboardEvent) {
    if (KeyConstants.ArrowKeys.includes(e.key)) {
      log('\n\n\n');
      e.preventDefault();

      let newHeadTop: string;
      let newHeadLeft: string;
      let distanceToTravel: number;

      const actionX = actionXMap[e.key];
      const actionY = actionYMap[e.key];
      const headRect = headRef.current.getBoundingClientRect();
      const boardRect = boardRef.current.getBoundingClientRect();

      const positionLength = (boardRect.height * (100 - CELL_LENGTH_PERCENTAGE)) / 100;
      const distFromBoardTop = headRect.top - boardRect.top;
      const distFromBoardLeft = headRect.left - boardRect.left;
      // log(`positionLength= ${positionLength}`);
      // log(`distFromBoardTop= ${distFromBoardTop}`);
      // log(`distFromBoardLeft= ${distFromBoardLeft}`);

      //left/right
      if (actionX) {
        if (e.key === KeyConstants.Left) {
          distanceToTravel = distFromBoardLeft / positionLength;
        } else {
          distanceToTravel = (positionLength - distFromBoardLeft) / positionLength;
        }

        newHeadTop = `${(distFromBoardTop / boardRect.height) * 100}%`;
        newHeadLeft = actionX;
      }

      //up/down
      else {
        if (e.key === KeyConstants.Up) {
          distanceToTravel = distFromBoardTop / positionLength;
          log('\n\n\n');
          log(` ** distFromBoardTop= ${distFromBoardTop}`);
          log(` ** distanceToTravel= ${distanceToTravel}`);
        } else {
          distanceToTravel = (positionLength - distFromBoardTop) / positionLength;
        }

        newHeadTop = actionY;
        newHeadLeft = `${(distFromBoardLeft / boardRect.height) * 100}%`;
      }

      log('/* ************************************************ |');
      log(`/*                     ${e.key}                   |`);
      log('/* ________________________________________________ |');
      log(`top: ${newHeadTop},  left: ${newHeadLeft}`);
      log(`current headRef  left: ${headRef.current.style.left}`);
      log(`current headRect left: ${distFromBoardLeft}`);
      log(`current headRect left: ${(distFromBoardLeft / positionLength) * 100}%`);
      log(`== transitionDuration: ${distanceToTravel * speedVariant} ==`);

      headRef.current.style.transitionDuration = `${distanceToTravel * speedVariant * 1000}ms`;
      headRef.current.style.top = newHeadTop;
      headRef.current.style.left = newHeadLeft;
      // setTransitionDuration(distanceToTravel * speedVariant * 1000);
      // setHeadTop(newHeadTop);
      // setHeadLeft(newHeadLeft);
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      handleKeyPress(e);
      // setCurrentKey(e.key);
    });
  }, []);

  useEffect(() => {
    log('/* ************************************************ |');
    log('/*                                                  |');
    log('/*         useEffect(() => { }, []);                |');
    log('/*                                                  |');
    log('/* ________________________________________________ |');

    window.addEventListener('resize', () => setBoardLength(boardRef.current.clientHeight));

    // const children = boardRef.current.childNodes;
    // log(`children.length: ${children.length}`);
  }, []);

  // debug
  // useEffect(() => {
  //   log(`change  -  length: ${boardLength}`);
  // }, [boardLength]);
  // useEffect(() => {
  //   log(`change  -  currentKey: ${currentKey}`);
  // }, [currentKey]);

  const cellLengthStyle: CSSProperties = {
    height: `${CELL_LENGTH_PERCENTAGE}%`,
    width: `${CELL_LENGTH_PERCENTAGE}%`,
  };

  return (
    <div id="board" className={styles.board}>
      <div className={`row ${styles.innerBoard}`} style={{ flexWrap: 'wrap' }} ref={boardRef}>
        {range(0, CELLS_PER_ROW * CELLS_PER_ROW).map((i) => {
          const isLightSquare =
            CELLS_PER_ROW % 2 === 0 ? ((i / CELLS_PER_ROW) | 0) % 2 === 0 && i % 2 === 0 : i % 2 === 0;
          return (
            <div
              key={`cell-${i}`}
              // className={styles.cell}
              style={{
                ...cellLengthStyle,
                backgroundColor: `${isLightSquare ? 'grey' : 'darkgray'}`,
              }}
            ></div>
          );
        })}
        <div
          className={styles.head}
          style={{
            ...cellLengthStyle,
            // top: 0,
            // left: 0,
            top: headTop,
            left: headLeft,
            transitionDuration: `${transitionDuration}ms`,
          }}
          ref={headRef}
        ></div>
      </div>
    </div>
  );
}

export default SnakeBoard;
