import { useState } from 'react';
import BoardComponent from '../chess/components/BoardComponent';
import Layout from '../components/Layout/Layout';
import Settings, { Configuration } from '../components/Layout/Settings';

type ChessProps = {};

function Chess({}: ChessProps): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    // setCookie(COOKIE_, );
  };

  const settingsConfigs: Configuration[] = [];

  return (
    <Layout openSettings={() => setIsSettingsOpen(true)} disabled={isSettingsOpen}>
      {isSettingsOpen && <Settings configs={settingsConfigs} onClose={closeSettings} />}
      <div className={`column container outline`}>
        <BoardComponent isPlayerWhite={true} />
      </div>
    </Layout>
  );
}

export default Chess;
