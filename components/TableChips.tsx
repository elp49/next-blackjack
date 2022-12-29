import styles from '../styles/table.module.css';
import { Chip } from './ChipSelector';

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

type TableChipsProps = {
  addChip: (chip: Chip) => void;
  disabled: boolean;
};
type ChipProps = {
  chip: Chip;
  onChipSelected: (chip: Chip) => void;
};

export default function TableChips({ addChip, disabled }: TableChipsProps): JSX.Element {
  function Chip({ chip, onChipSelected }: ChipProps): JSX.Element {
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
    <>
      {CHIPS.map((row, i) => (
        <div
          key={`chipSelectorRow-${i}`}
          className="half row outline"
          style={{ fontSize: '1.3em', justifyContent: 'center' }}
        >
          {row.map((chip) => (
            <Chip key={`chipSelector${chip.value}`} chip={chip} onChipSelected={addChip} />
          ))}
        </div>
      ))}
    </>
  );
}
