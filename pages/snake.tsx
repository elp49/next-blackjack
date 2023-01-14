import { getCookie, hasCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Settings, { Configuration } from '../components/Layout/Settings';
import SnakeBoard from '../snake/components/SnakeBoard';
import { log } from '../utils/utils';
import { GlobalConfig } from './_app';

const COOKIE_DEBUG = 'debug';

function Snake({ cookiesConfig: [isCookiesEnabled, setIsCookiesEnabled] }: GlobalConfig): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    if (isCookiesEnabled) {
      setCookie(COOKIE_DEBUG, isDebugMode);
    }
  };

  useEffect(() => {
    // Bootstrap cookies
    if (isCookiesEnabled) {
      log('Bootstrapping cookies...');
      if (hasCookie(COOKIE_DEBUG)) {
        const isDebugMode = getCookie(COOKIE_DEBUG) as boolean;
        setIsDebugMode(isDebugMode);
      }
    }
  }, [isCookiesEnabled]);

  const settingsConfigs: Configuration[] = [
    {
      title: `Debug Mode: ${isDebugMode ? 'ON' : 'OFF'}`,
      setting: [isDebugMode, (isDebugMode) => setIsDebugMode(isDebugMode)],
    },
  ];

  return (
    <Layout
      title="Snake"
      favicon="/favicon.snake.ico"
      openSettings={() => setIsSettingsOpen(true)}
      disabled={isSettingsOpen}
    >
      {isSettingsOpen && <Settings configs={settingsConfigs} onClose={closeSettings} />}
      <div className={`column outline`} style={{ justifyContent: 'center', minHeight: '85vh' }}>
        <SnakeBoard isDebugMode={isDebugMode} />
      </div>
    </Layout>
  );
}

export default Snake;
