import Head from 'next/head';
import { Dispatch, SetStateAction } from 'react';
import styles from '../../styles/layout.module.css';
import Footer from './Footer';
import Header from './Header';

const TITLE = 'Blackjack';

type LayoutProps = {
  settings: [boolean, Dispatch<SetStateAction<boolean>>];
  children?: React.ReactNode;
};

const Layout = ({ settings, children }: LayoutProps) => {
  return (
    <div id={'layout'} className={styles.layout}>
      <Head>
        <title>{TITLE}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Header settings={settings} />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
