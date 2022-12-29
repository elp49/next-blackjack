import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import styles from '../../styles/layout.module.css';

export type HeaderProps = {
  openSettings: () => void;
  disabled: boolean;
};

const Header = ({ openSettings, disabled }: HeaderProps) => {
  return (
    <header id={'header'}>
      <div className={`${styles.header} row`} style={{ justifyContent: 'flex-end' }}>
        {/* <div className="column"> */}
        <Button onClick={openSettings} disabled={disabled} style={{ padding: 0, minWidth: '1em' }}>
          <SettingsIcon color="action" style={{ fontSize: '3rem' }} />
        </Button>
        {/* </div> */}
      </div>
    </header>
  );
};

export default Header;
