import { setCookie } from 'cookies-next';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import Settings, { Configuration } from '../components/Layout/Settings';
import styles from '../styles/index.module.css';
import { COOKIE_ENABLE_COOKIES, GlobalConfig } from './_app';

function Home({ cookiesConfig: [isCookiesEnabled, setIsCookiesEnabled] }: GlobalConfig): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    setCookie(COOKIE_ENABLE_COOKIES, isCookiesEnabled);
  };

  const settingsConfigs: Configuration[] = [
    {
      title: `Cookies: ${isCookiesEnabled ? 'Enabled' : 'Disabled'}`,
      setting: [isCookiesEnabled, (isCookiesEnabled) => setIsCookiesEnabled(isCookiesEnabled)],
    },
  ];

  return (
    <Layout
      title="Games"
      favicon="/favicon.gameboy.ico"
      openSettings={() => setIsSettingsOpen(true)}
      disabled={isSettingsOpen}
    >
      {isSettingsOpen && <Settings configs={settingsConfigs} onClose={closeSettings} />}
      <div className={styles.container}>
        <div className="whole column">
          <div className="third column">
            {/* <h1>Blackjack</h1>
            <h3>best of luck ;)</h3> */}
          </div>
          <div className="column" style={{ width: '100%' }}>
            <Link href="/blackjack" className={`${styles.sexyButton} ${styles.large}`}>
              Blackjack
            </Link>
            <Link href="/chess" className={`${styles.sexyButton} ${styles.large}`}>
              Chess
            </Link>
            <Link href="/snake" className={`${styles.sexyButton} ${styles.large}`}>
              Snake
            </Link>
          </div>
          <div className="third column"></div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
