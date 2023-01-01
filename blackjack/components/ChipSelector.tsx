import { useEffect, useState } from 'react';
import Panel from '../../components/Panel';
import SexyButton from '../../components/SexyButton';
import PlayerChips from './PlayerChips';
import TableChips from './TableChips';

export type Chip = {
  value: number;
  color: string;
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
        <TableChips addChip={addChip} disabled={disabled} />
      </div>
      <div className="tenth row outline">
        <SexyButton text="Clear" onClick={() => setChips([])} disabled={disabled} />
        <SexyButton text="Deal" onClick={() => deal(wager)} disabled={wager === 0 || disabled} />
      </div>
    </div>
  );
}
