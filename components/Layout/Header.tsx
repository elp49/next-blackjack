import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import Link from 'next/link';
import styles from '../../styles/layout.module.css';

export type HeaderProps = {
  openSettings: () => void;
  disabled: boolean;
};

const Header = ({ openSettings, disabled }: HeaderProps) => {
  return (
    <header id={'header'}>
      <div className={`${styles.header} row`} style={{ justifyContent: 'space-between' }}>
        {/* <div className="column"> */}
        <Link href="/" className={styles.goBack}>
          <ArrowBackIcon style={{ fontSize: '2em' }} />
        </Link>
        <Button onClick={openSettings} disabled={disabled} style={{ padding: 0, minWidth: '1em' }}>
          <SettingsIcon color="action" style={{ fontSize: '3rem' }} />
        </Button>
        {/* </div> */}
      </div>
    </header>
  );
};

export default Header;
