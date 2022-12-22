import Layout from '../components/Layout/Layout';
import Button from '@mui/material/Button';
import React from 'react';
import styles from '../styles/home.module.css';

function Home(): JSX.Element {
  return (
    <Layout>
      <div className={styles.container}>
        <div className="whole column">
          <div className="third column">
            <h1>Blackjack</h1>
            <h3 style={{ alignSelf: '' }}>best of luck ;)</h3>
          </div>
          <div className="third column">
            <Button href="/blackjack" variant="contained" size="large">
              Play
            </Button>
          </div>
          <div className="third column"></div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
