import Head from 'next/head';
import { useEffect } from 'react';
import styles from '../../styles/layout.module.css';
import { createStyle } from '../../utils/utils';
import Footer from './Footer';
import Header from './Header';

const TITLE = 'Blackjack';

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  useEffect(() => {
    createStyle(`
      html, body {
      }
    `);
  }, []);

  return (
    <div id={'layout'} className={styles.layout}>
      <Head>
        <title>{TITLE}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      {children}
      {/* <div className={styles.container}>{children}</div> */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
