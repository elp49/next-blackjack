import React from 'react';
import classes from '../styles/table.module.css';

type PanelProps = {
  info: string[];
  style?: React.CSSProperties;
};

export default function Panel({ info, style }: PanelProps) {
  return (
    <div className={classes.panel} style={style}>
      {info.map((x, i) => (
        <span key={`panelInfo${x}-${i}`} style={{ margin: '0.5em 1em 0.5em 1em' }}>
          {x}
        </span>
      ))}
    </div>
  );
}
