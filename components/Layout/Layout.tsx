import Head from 'next/head';
import styles from '../../styles/layout.module.css';
import Footer from './Footer';
import Header from './Header';

const TITLE = 'Blackjack';

type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  /* useEffect(() => {
    createStyle(`
      html, body {
      }
    `);
  }, []); */

  return (
    <div id={'layout'} className={styles.layout}>
      <Head>
        <title>{TITLE}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
