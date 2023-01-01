import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { Button } from '@mui/material';

type PromptProps = {
  promptText: string;
  respond: (response: boolean) => void;
  isPromptActive: boolean;
};

export default function Prompt({ promptText, respond, isPromptActive }: PromptProps): JSX.Element {
  const yes = () => {
    console.log('yes');
    respond(true);
  };
  const no = () => {
    console.log('no');

    respond(false);
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: 0,
    minWidth: '1em',
    boxShadow: '0 0.0625em 0.125em rgb(0, 0, 0)',
  };

  return (
    isPromptActive && (
      <div
        id="prompt"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 99,
        }}
      >
        <div className="whole row" style={{ justifyContent: 'space-around', zIndex: 10 }}>
          <Button onClick={yes} style={buttonStyle}>
            <CheckBoxIcon color="success" style={{ fontSize: '3rem' }} />
          </Button>
          <div
            className="row"
            style={{
              backgroundColor: '#333',
              boxShadow: '0 0.0625em 0.125em rgb(0, 0, 0)',
              // opacity: 0.8,
              color: 'white',
              fontWeight: '800',
              height: '3em',
              minWidth: '10em',
              padding: '1em',
              margin: '2em',
              border: '1px solid #ddd',
              borderRadius: '.5em',
              textAlign: 'center',
            }}
          >
            <span>{promptText}</span>
          </div>
          <Button onClick={no} style={buttonStyle}>
            <DisabledByDefaultIcon color="error" style={{ fontSize: '3rem' }} />
          </Button>
        </div>
      </div>
    )
  );
}
