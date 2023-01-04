import { CSSProperties } from 'react';
import styles from '../../styles/table.module.css';
import { range } from '../../utils/utils';
import { Chip } from './ChipSelector';

type PlayerChipsProps = {
  chips: Chip[];
  removeChip: (index: number) => void;
  disabled: boolean;
};
type RecursivePlayerChipsProps = {
  index: number;
  iStack: number;
  chips: Chip[];
  isFirst: boolean;
  // remove: () => void;
};

export default function PlayerChips({ chips, removeChip, disabled }: PlayerChipsProps): JSX.Element {
  const nStacks = chips.length < 5 ? 1 : Math.ceil(chips.length / 5);

  /* const removeChip = (iStack: number, index: number): void => {
    const newChips = [...chips];
    newChips.splice(iStack * 5 + index, 1)[0].value;
    setChips(newChips);
  }; */

  function RecursivePlayerChips({ index, iStack, chips, isFirst }: RecursivePlayerChipsProps): JSX.Element {
    const isLast = chips.length === 1;
    const grandchildren = [...chips];
    const child = grandchildren && grandchildren.length > 0 ? grandchildren.shift() : null;
    const { value, color } = child;

    const children = (
      <>
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        >
          {value % 1000 === 0 ? `${value / 1000}K` : value}
        </span>
        {!isLast && <RecursivePlayerChips index={index + 1} iStack={iStack} chips={grandchildren} isFirst={false} />}
      </>
    );

    const style: CSSProperties = {
      position: 'relative',
      fontSize: '1.3rem',
      backgroundImage: `url(/images/blackjack/chip-${color}.png)`,
      transform: 'translate(0,-15%)',
    };

    return isLast ? (
      <button onClick={() => removeChip(iStack * 5 + index)} disabled={disabled} className={styles.chip} style={style}>
        {children}
      </button>
    ) : (
      <div className={styles.chip} style={style}>
        {children}
      </div>
    );
  }

  return chips.length > 0 ? (
    range(0, nStacks).map((iStack) => {
      const iStart = iStack * 5;
      const iEnd = iStart + 5 > chips.length ? chips.length : iStart + 5;
      const stack = chips.slice(iStart, iEnd);

      return (
        <div key={`stack-${iStack}`} className="column someSpace">
          <RecursivePlayerChips
            index={0}
            iStack={iStack}
            chips={stack}
            isFirst={true}
            // remove={() => removeChip(iStack, index)}
          />
        </div>
      );
    })
  ) : (
    <></>
  );
}
