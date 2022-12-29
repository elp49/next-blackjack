import { Button } from '@mui/material';
import { CSSProperties } from 'react';
import styles from '../styles/sexyButton.module.css';

type SexyButtonProps = {
  text: string;
  onClick: () => void;
  disabled: boolean;
  style?: CSSProperties;
};

export default function SexyButton({ text, onClick, disabled, style }: SexyButtonProps): JSX.Element {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.sexiness} ${disabled && styles.disabled}`}
      style={{ color: 'white', ...style }}
    >
      {text.toUpperCase()}
    </Button>
  );
}
