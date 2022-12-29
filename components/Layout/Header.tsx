import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import styles from '../../styles/layout.module.css';

type HeaderProps = {
  settings: [boolean, Dispatch<SetStateAction<boolean>>];
};

const Header = ({ settings }: HeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = settings;
  const openSettings = () => setIsSettingsOpen(true);

  return (
    <header id={'header'}>
      <div className={`${styles.header} row`} style={{ justifyContent: 'flex-end' }}>
        <div className="column">
          <Button onClick={openSettings} disabled={isSettingsOpen} style={{ padding: 0, minWidth: '1em' }}>
            <SettingsIcon color="action" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
