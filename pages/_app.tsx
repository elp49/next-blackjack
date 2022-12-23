import type { AppProps } from 'next/app';
import Layout from '../components/Layout/Layout';
import '../styles/globals.css';

const BlackjackWebApp = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
);

export default BlackjackWebApp;
