import { getCookie, hasCookie, setCookie } from 'cookies-next';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Settings from '../components/Layout/Settings';
import '../styles/globals.css';

const COOKIE_OFFER_INSURANCE = 'offerInsurance';
const COOKIE_SOFT_SEVENTEEN = 'dealerHitSoft17';
const COOKIE_SHOW_COUNT = 'showCount';

export type AppSettings = {
  disabled: boolean;
  offerInsurance: boolean;
  dealerHitSoft17: boolean;
  showRunningCount: boolean;
};

const BlackjackWebApp = ({ Component, pageProps }: AppProps) => {
  const [didBootstrapCookies, setDidBootstrapCookies] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Cookies
  const [offerInsurance, setOfferInsurance] = useState<boolean>(true);
  const [dealerHitSoft17, setDealerHitSoft17] = useState<boolean>(false);
  const [showRunningCount, setShowRunningCount] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    setCookie(COOKIE_OFFER_INSURANCE, offerInsurance);
    setCookie(COOKIE_SOFT_SEVENTEEN, dealerHitSoft17);
    setCookie(COOKIE_SHOW_COUNT, showRunningCount);
  };

  useEffect(() => {
    if (!didBootstrapCookies) {
      if (hasCookie(COOKIE_OFFER_INSURANCE)) {
        const offer = getCookie(COOKIE_OFFER_INSURANCE) as boolean;
        setOfferInsurance(offer);
      }

      if (hasCookie(COOKIE_SOFT_SEVENTEEN)) {
        const hitSoft = getCookie(COOKIE_SOFT_SEVENTEEN) as boolean;
        setDealerHitSoft17(hitSoft);
      }

      if (hasCookie(COOKIE_SHOW_COUNT)) {
        const showCount = getCookie(COOKIE_SHOW_COUNT) as boolean;
        setShowRunningCount(showCount);
      }

      setDidBootstrapCookies(true);
    }
  }, [didBootstrapCookies]);

  return (
    <Layout settings={[isSettingsOpen, setIsSettingsOpen]}>
      {isSettingsOpen && (
        <Settings
          configs={[
            { title: 'Offer Insurance', setting: [offerInsurance, setOfferInsurance] },
            { title: 'Dealer Hits Soft 17', setting: [dealerHitSoft17, setDealerHitSoft17] },
            { title: 'Show Running Count', setting: [showRunningCount, setShowRunningCount] },
          ]}
          onClose={closeSettings}
        />
      )}
      <Component
        {...pageProps}
        appSettings={{ disabled: isSettingsOpen, offerInsurance, dealerHitSoft17, showRunningCount }}
      />
    </Layout>
  );
};

export default BlackjackWebApp;
