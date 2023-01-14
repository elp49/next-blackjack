import { getCookie, hasCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import BoardComponent from '../chess/components/BoardComponent';
import Layout from '../components/Layout/Layout';
import Settings, { Configuration } from '../components/Layout/Settings';
import { log, range } from '../utils/utils';
import { GlobalConfig } from './_app';

export const BOARD_LENGTH = 8;

export const X_AXIS_VALUES = 'A B C D E F G H'.split(' ');
export const Y_AXIS_VALUES: number[] = range(1, BOARD_LENGTH);

const COOKIE_COLOR = 'color';
const COOKIE_DEBUG = 'debug';

function Chess({ cookiesConfig: [isCookiesEnabled, setIsCookiesEnabled] }: GlobalConfig): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isPlayerWhite, setIsPlayerWhite] = useState<boolean>(true);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    if (isCookiesEnabled) {
      setCookie(COOKIE_COLOR, isPlayerWhite);
      setCookie(COOKIE_DEBUG, isDebugMode);
    }
  };

  useEffect(() => {
    // Bootstrap cookies
    if (isCookiesEnabled) {
      log('Bootstrapping cookies...');
      if (hasCookie(COOKIE_COLOR)) {
        const isPlayerWhite = getCookie(COOKIE_COLOR) as boolean;
        setIsPlayerWhite(isPlayerWhite);
      }
      if (hasCookie(COOKIE_DEBUG)) {
        const isDebugMode = getCookie(COOKIE_DEBUG) as boolean;
        setIsDebugMode(isDebugMode);
      }
    }
  }, [isCookiesEnabled]);

  const settingsConfigs: Configuration[] = [
    {
      title: `Piece Color: ${isPlayerWhite ? 'White' : 'Black'}`,
      setting: [isPlayerWhite, (isPlayerWhite) => setIsPlayerWhite(isPlayerWhite)],
    },
    {
      title: `Debug Mode: ${isDebugMode ? 'ON' : 'OFF'}`,
      setting: [isDebugMode, (isDebugMode) => setIsDebugMode(isDebugMode)],
    },
  ];

  const [xAxis, setXAxis] = useState<string[]>([]);
  const [yAxis, setYAxis] = useState<number[]>([]);

  useEffect(() => {
    if (isPlayerWhite) {
      setXAxis(X_AXIS_VALUES);
      setYAxis(Y_AXIS_VALUES.slice().reverse());
      log(`Y_AXIS_VALUES.reverse(): [${Y_AXIS_VALUES.slice().reverse().join(', ')}]`);
    } else {
      setXAxis(X_AXIS_VALUES.slice().reverse());
      setYAxis(Y_AXIS_VALUES);
      log(`X_AXIS_VALUES.reverse(): [${X_AXIS_VALUES.slice().reverse().join(', ')}]`);
    }
  }, [isPlayerWhite]);

  return (
    <Layout
      title="Chess"
      favicon="/favicon.chess.ico"
      openSettings={() => setIsSettingsOpen(true)}
      disabled={isSettingsOpen}
    >
      {isSettingsOpen && <Settings configs={settingsConfigs} onClose={closeSettings} />}
      <div className={`column outline`} style={{ justifyContent: 'center', minHeight: '85vh' }}>
        <BoardComponent isPlayerWhite={isPlayerWhite} xAxis={xAxis} yAxis={yAxis} isDebugMode={isDebugMode} />
      </div>
    </Layout>
  );
}

export default Chess;
