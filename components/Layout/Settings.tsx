import { Button, Switch } from '@mui/material';

type Configuration = {
  title: string;
  setting: [boolean, (value: boolean) => void];
  // setting: [boolean, Dispatch<SetStateAction<boolean>>];
};

type SettingsProps = {
  configs: Configuration[];
  onClose: () => void;
};

export default function Settings({ configs, onClose }: SettingsProps): JSX.Element {
  return (
    <div
      id="settings"
      className="column"
      style={{
        height: '75vh',
        width: '80vw',
        // width: '80%',
        // margin: '3em auto 3em auto',
        padding: '3em',
        borderRadius: '1em',
        color: '#000',
        // textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 2px #000, -1px -1px 2px #000',
        // textShadow: '-1px 1px 2px #fff, 1px 1px 2px #fff, 1px -1px 2px #fff, -1px -1px 2px #fff',
        backgroundColor: '#eee',
        // boxShadow: '0 0.0625em 0.125em rgb(0, 0, 0)',
        boxShadow:
          'inset 0 -3em 3em rgba(0, 0, 0, 0.1), 0 0 0 2px rgb(255, 255, 255), 0.3em 0.3em 1em rgba(0, 0, 0, 0.3)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99,
      }}
    >
      <div className="quarter row outline">
        <h1>Settings</h1>
      </div>
      <div className="half column outline" style={{ justifyContent: 'flex-start' }}>
        {configs.map(({ title, setting: [setting, setSetting] }) => (
          <div key={title} className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
            {/* className="half row" style={{ justifyContent: 'space-between', padding: '1em' }}> */}
            <h3>{title}</h3>
            <Switch
              checked={setting}
              onChange={() => setSetting(!setting)}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </div>
        ))}
      </div>
      <div className="quarter row outline" style={{ justifyContent: 'space-evenly' }}>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
