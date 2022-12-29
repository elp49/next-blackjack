import Button from '@mui/material/Button';
import styles from '../styles/index.module.css';
import tableStyles from '../styles/table.module.css';

function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className="whole column">
        <div className="third column">
          <h1>Blackjack</h1>
          <h3>best of luck ;)</h3>
        </div>
        <div className="third column">
          <Button href="/blackjack" variant="contained" size="large" className={tableStyles.button}>
            Play
          </Button>
        </div>
        <div className="third column"></div>
      </div>
    </div>
  );
}

export default Home;
