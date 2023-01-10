import Head from 'next/head';
import styles from '../../styles/layout.module.css';
import Footer from './Footer';
import Header, { HeaderProps } from './Header';

type LayoutProps = HeaderProps & {
  title: string;
  children?: React.ReactNode;
};

const Layout = ({ openSettings, disabled, title, children }: LayoutProps) => {
  return (
    <div id={'layout'} className={styles.layout}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Header openSettings={openSettings} disabled={disabled} />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
