import { Button } from '@mui/material';
import React, { useState } from 'react';
import styles from '../styles/table.module.css';

const CHIPS = [
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

type ChipProps = {
  value: number;
  color: string;
  onSelect: (number) => void;
};

function Chip({ value, color, onSelect }: ChipProps): JSX.Element {
  return (
    <button
      onClick={() => onSelect(value)}
      className={styles.chip}
      style={{
        backgroundImage: `url(/images/chip-${color}.png)`,
      }}
    >
      <span>{value % 1000 === 0 ? `${value / 1000}K` : value}</span>
    </button>
  );
}

type ChipSelectorProps = {
  deal: (number) => void;
};

export default function ChipSelector({ deal }: ChipSelectorProps): JSX.Element {
  const [wager, setWager] = useState<number>(0);
  const onChipSelected = (value: number) => setWager(wager + value);
  return (
    <div className="whole column">
      <div className="half row outline">{wager > 0 && <h3>${wager}</h3>}</div>
      <div id="chips" className="quarter column" style={{ justifyContent: 'space-evenly', padding: '0 4em 0 4em' }}>
        {CHIPS.map((row, i) => (
          <div key={`chipRow-${i}`} className="half row outline" style={{ justifyContent: 'space-evenly' }}>
            {row.map(({ value, color }) => (
              <Chip key={`chip${value}`} value={value} color={color} onSelect={onChipSelected} />
            ))}
          </div>
        ))}
      </div>
      <div className="tenth row outline">
        <Button onClick={() => setWager(0)} variant="contained" style={{ margin: '1em' }}>
          Clear
        </Button>
        <Button onClick={() => deal(wager)} disabled={wager === 0} variant="contained" style={{ margin: '1em' }}>
          Deal
        </Button>
      </div>
    </div>
  );
}
