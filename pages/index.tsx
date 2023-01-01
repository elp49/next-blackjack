import Link from 'next/link';
import styles from '../styles/index.module.css';

function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className="whole column">
        <div className="third column">
          <h1>Blackjack</h1>
          <h3>best of luck ;)</h3>
        </div>
        <div className="third column">
          <Link href="/blackjack" className={styles.sexyButton}>
            Blackjack
          </Link>
        </div>
        <div className="third column"></div>
      </div>
    </div>
  );
}

export default Home;
