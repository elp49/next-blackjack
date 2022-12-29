import { CSSProperties, useEffect, useState } from 'react';
import styles from '../styles/table.module.css';
import { range } from '../utils/utils';
import Panel from './Panel';
import SexyButton from './SexyButton';

const CHIPS: Chip[][] = [
  [
    { value: 1, color: 'white' },
    { value: 5, color: 'red' },
    { value: 25, color: 'green' },
  ],
  [
    { value: 100, color: 'black' },
    { value: 500, color: 'purple' },
    { value: 1000, color: 'yellow' },
  ],
];

type Chip = {
  value: number;
  color: string;
};
type ChipProps = {
  chip: Chip;
  onChipSelected: (chip?: Chip) => void;
  isDisabled: boolean;
};
type PlayerChipsProps = {
  index: number;
  iStack: number;
  chips: Chip[];
  isFirst: boolean;
};
type ChipSelectorProps = {
  deal: (number) => void;
  isSettingsOpen: boolean;
};

export default function ChipSelector({ deal, isSettingsOpen }: ChipSelectorProps): JSX.Element {
  const [chips, setChips] = useState<Chip[]>([]);
  const [wager, setWager] = useState<number>(0);

  const addChip = (chip: Chip) => setChips([...chips, chip]);
  const removeChip = (iStack: number, index: number): void => {
    const newChips = [...chips];
    newChips.splice(iStack * 5 + index, 1)[0].value;
    /* const splicedValue = newChips.splice(iStack * 5 + index, 1)[0].value
    console.log(
      `============================================================[...chips].splice: ${
        splicedValue
      }`
    ); */
    // setChips([...chips.slice(0, -1)]);
    setChips(newChips);
  };

  useEffect(() => {
    let newWager = 0;
    /* console.log('adding chip');
    console.log(chips.length); */
    if (chips.length > 0) newWager = chips.map((x) => x.value).reduce((a, b) => a + b);
    setWager(newWager);
  }, [chips]);

  function Chip({ chip, onChipSelected, isDisabled }: ChipProps): JSX.Element {
    const { value, color } = chip;
    return (
      <button
        onClick={() => onChipSelected(chip)}
        disabled={isDisabled}
        className={styles.chip}
        style={{
          backgroundImage: `url(/images/chip-${color}.png)`,
          margin: '1em',
        }}
      >
        <span>{value % 1000 === 0 ? `${value / 1000}K` : value}</span>
      </button>
    );
  }

  function PlayerChips({ index, iStack, chips, isFirst }: PlayerChipsProps): JSX.Element {
    const isLast = chips.length === 1;
    const grandchildren = [...chips];
    const child = grandchildren && grandchildren.length > 0 ? grandchildren.shift() : null;
    const { value, color } = child;
    // const rotate = !isLast ? 5 * index : 0;

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
        {!isLast && <PlayerChips index={index + 1} iStack={iStack} chips={grandchildren} isFirst={false} />}
      </>
    );

    const style: CSSProperties = {
      position: 'relative',
      fontSize: '1.3rem',
      // margin: `${!isFirst && '0 0 1rem 0.5rem'}`,
      // marginLeft: `${!isFirst && '1rem'}`,
      backgroundImage: `url(/images/chip-${color}.png)`,
      transform: 'translate(0,-15%)',
      // transform: `rotate(${rotate}turn)`,
    };

    return isLast ? (
      <button onClick={() => removeChip(iStack, index)} disabled={isSettingsOpen} className={styles.chip} style={style}>
        {children}
      </button>
    ) : (
      <div className={styles.chip} style={style}>
        {children}
      </div>
    );
  }

  const nStacks = chips.length < 5 ? 1 : Math.ceil(chips.length / 5);
  const isClearDisabled = isSettingsOpen;
  const isDealDisabled = wager === 0 || isSettingsOpen;

  return (
    <div className="whole column">
      <div
        className="half row wrap outline"
        style={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '0 4em 0 4em',
        }}
      >
        {/* {chips.length > 0 && <PlayerChips index={0} chips={chips} isFirst={true} />} */}
        {chips.length > 0 &&
          range(0, nStacks).map((iStack) => {
            const iStart = iStack * 5;
            const iEnd = iStart + 5 > chips.length ? chips.length : iStart + 5;
            const stack = chips.slice(iStart, iEnd);
            /* console.log(`nStacks: ${nStacks}`);
            console.log(`iStack: ${iStack}`);
            console.log(`chips.length: ${chips.length}`);
            console.log(`iStart: ${iStart}`);
            console.log(`iEnd: ${iEnd}`);
            console.log(`stack.length: ${stack.length}`);
            console.log(`stack: ${stack.map((x) => x.value).join(', ')}`); */
            return (
              <div key={`stack-${iStack}`} className="column someSpace">
                <PlayerChips index={0} iStack={iStack} chips={stack} isFirst={true} />
              </div>
            );
          })}
      </div>
      <Panel info={['Wager', `$${wager}`]} />
      <div id="chips" className="third column" style={{ justifyContent: 'space-evenly', padding: '0 4em 0 4em' }}>
        {CHIPS.map((row, i) => (
          <div
            key={`chipSelectorRow-${i}`}
            className="half row outline"
            style={{ fontSize: '1.3em', justifyContent: 'center' }}
          >
            {row.map((chip) => (
              <Chip
                key={`chipSelector${chip.value}`}
                chip={chip}
                onChipSelected={addChip}
                isDisabled={isSettingsOpen}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="tenth row outline">
        <SexyButton text="Clear" onClick={() => setChips([])} disabled={isClearDisabled} />
        <SexyButton text="Deal" onClick={() => deal(wager)} disabled={isDealDisabled} />
      </div>
    </div>
  );
}
