import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { Button } from '@mui/material';

type InsuranceProps = {
  insure: (boolean) => void;
  active: boolean;
};

export default function InsurancePrompt({ insure, active }: InsuranceProps): JSX.Element {
  const accept = () => insure(true);
  const decline = () => insure(false);

  return (
    active && (
      <div className="whole row" style={{ justifyContent: 'space-around' }}>
        <Button onClick={accept} style={{ backgroundColor: 'white', padding: 0, minWidth: '1em' }}>
          <CheckBoxIcon color="success" style={{ fontSize: '3rem' }} />
        </Button>
        <div
          className="row"
          style={{
            backgroundColor: '#333',
            boxShadow: '0 0.0625em 0.125em rgba(0, 0, 0, 0.15)',
            // opacity: 0.8,
            color: 'white',
            fontWeight: '800',
            height: '3em',
            width: '10em',
            margin: '2em',
            border: '1px solid #ddd',
            borderRadius: '.5em',
            textAlign: 'center',
          }}
        >
          <span>INSURANCE?</span>
        </div>
        <Button onClick={decline} style={{ backgroundColor: 'white', padding: 0, minWidth: '1em' }}>
          <DisabledByDefaultIcon color="error" style={{ fontSize: '3rem' }} />
        </Button>
      </div>
    )
  );
}
