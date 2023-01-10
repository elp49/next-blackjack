import { getCookie, hasCookie } from 'cookies-next';
import type { AppProps } from 'next/app';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import '../styles/globals.css';
import { log } from '../utils/utils';

export const COOKIE_ENABLE_COOKIES = 'enableCookies';

export type GlobalConfig = {
  cookiesConfig: [boolean, Dispatch<SetStateAction<boolean>>];
};

const BlackjackWebApp = ({ Component, pageProps }: AppProps) => {
  const [isCookiesEnabled, setIsCookiesEnabled] = useState<boolean>(false);

  useEffect(() => {
    log('Bootstrapping GLOBAL cookies...');
    if (hasCookie(COOKIE_ENABLE_COOKIES)) {
      // Bootstrap cookies
      const isCookiesEnabled = getCookie(COOKIE_ENABLE_COOKIES) as boolean;
      setIsCookiesEnabled(isCookiesEnabled);
    }
  }, []);

  return <Component {...pageProps} cookiesConfig={[isCookiesEnabled, setIsCookiesEnabled]} />;
};

export default BlackjackWebApp;
