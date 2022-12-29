import { useEffect, useState } from 'react';
import styles from '../styles/table.module.css';
import Panel from './Panel';
import PlayerChips from './PlayerChips';
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

export type Chip = {
  value: number;
  color: string;
};
type ChipProps = {
  chip: Chip;
  onChipSelected: (chip?: Chip) => void;
  disabled: boolean;
};
type ChipSelectorProps = {
  deal: (number) => void;
  disabled: boolean;
};

export default function ChipSelector({ deal, disabled }: ChipSelectorProps): JSX.Element {
  const [chips, setChips] = useState<Chip[]>([]);
  const [wager, setWager] = useState<number>(0);

  const addChip = (chip: Chip) => setChips([...chips, chip]);

  const removeChip = (index: number): void => {
    const newChips = [...chips];
    newChips.splice(index, 1)[0].value;
    setChips(newChips);
  };

  useEffect(() => {
    let newWager = 0;
    if (chips.length > 0) newWager = chips.map((x) => x.value).reduce((a, b) => a + b);
    setWager(newWager);
  }, [chips]);

  function Chip({ chip, onChipSelected, disabled }: ChipProps): JSX.Element {
    const { value, color } = chip;
    return (
      <button
        onClick={() => onChipSelected(chip)}
        disabled={disabled}
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
        <PlayerChips chips={chips} removeChip={removeChip} disabled={disabled} />
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
              <Chip key={`chipSelector${chip.value}`} chip={chip} onChipSelected={addChip} disabled={disabled} />
            ))}
          </div>
        ))}
      </div>
      <div className="tenth row outline">
        <SexyButton text="Clear" onClick={() => setChips([])} disabled={disabled} />
        <SexyButton text="Deal" onClick={() => deal(wager)} disabled={wager === 0 || disabled} />
      </div>
    </div>
  );
}
