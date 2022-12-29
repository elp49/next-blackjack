import { Button } from '@mui/material';
import { CSSProperties } from 'react';

type SexyButtonProps = {
  text: string;
  onClick: () => void;
  disabled: boolean;
  style?: CSSProperties;
};

export default function SexyButton({ text, onClick, disabled, style }: SexyButtonProps): JSX.Element {
  const sexyStyle: CSSProperties = {
    minWidth: '1em',
    fontFamily: 'serif',
    color: 'white',
    margin: '1em',
    backgroundImage:
      'linear-gradient(to bottom, #c27593, #ae4559, #96303f, #7d1b27, #640210, #4d0714, #360b13, #21080e)',
    textShadow: '-1px 1px 2px #000',
  };

  const disabledStyle: CSSProperties = disabled
    ? {
        backgroundImage: 'linear-gradient(to bottom, #4d0714, #360b13, #000)',
        opacity: '0.8',
      }
    : {};

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sexyStyle,
        ...disabledStyle,
        ...style,
      }}
    >
      {text.toUpperCase()}
    </Button>
  );
}
