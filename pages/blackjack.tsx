import { getCookie, hasCookie, setCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import Card from '../blackjack/classes/Card';
import Deck from '../blackjack/classes/Deck';
import Hand, { HandResult } from '../blackjack/classes/Hand';
import PlayerHand, { Decision } from '../blackjack/classes/PlayerHand';
import Results from '../blackjack/classes/Results';
import ChipSelector from '../blackjack/components/ChipSelector';
import HandComponent from '../blackjack/components/HandComponent';
import Layout from '../components/Layout/Layout';
import Settings, { Configuration } from '../components/Layout/Settings';
import Panel from '../components/Panel';
import Prompt from '../components/Prompt';
import SexyButton from '../components/SexyButton';
import styles from '../styles/table.module.css';
import { ACE, DECK_SIZE, NINETEEN, SEVENTEEN, TWELVE, TWENTY_ONE } from '../utils/constants';
import { isArrayEqual, log } from '../utils/utils';
import { GlobalConfig } from './_app';

const NUM_DECKS = 6;

// const DEFAULT_TIMEOUT = 100;
const DEFAULT_TIMEOUT = 500;

const COOKIE_OFFER_INSURANCE = 'offerInsurance';
const COOKIE_SOFT_SEVENTEEN = 'dealerHitSoft17';
const COOKIE_SHOW_COUNT = 'showCount';

export default function Blackjack({
  cookiesConfig: [isCookiesEnabled, setIsCookiesEnabled],
}: GlobalConfig): JSX.Element {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);

    // Update cookies.
    if (isCookiesEnabled) {
      log('UPDATING COOKIES');
      setCookie(COOKIE_OFFER_INSURANCE, offerInsurance);
      setCookie(COOKIE_SOFT_SEVENTEEN, dealerHitSoft17);
      setCookie(COOKIE_SHOW_COUNT, showRunningCount);
    }
  };

  // Cookies
  const [offerInsurance, setOfferInsurance] = useState<boolean>(true);
  const [dealerHitSoft17, setDealerHitSoft17] = useState<boolean>(false);
  const [showRunningCount, setShowRunningCount] = useState<boolean>(false);

  useEffect(() => {
    // Bootstrap cookies
    if (isCookiesEnabled) {
      log('Bootstrapping cookies...');
      if (hasCookie(COOKIE_OFFER_INSURANCE)) {
        const offerInsurance = getCookie(COOKIE_OFFER_INSURANCE) as boolean;
        setOfferInsurance(offerInsurance);
      }

      if (hasCookie(COOKIE_SOFT_SEVENTEEN)) {
        const dealerHitSoft17 = getCookie(COOKIE_SOFT_SEVENTEEN) as boolean;
        setDealerHitSoft17(dealerHitSoft17);
      }

      if (hasCookie(COOKIE_SHOW_COUNT)) {
        const showRunningCount = getCookie(COOKIE_SHOW_COUNT) as boolean;
        setShowRunningCount(showRunningCount);
      }
    }
  }, [isCookiesEnabled]);

  const settingsConfigs: Configuration[] = [
    {
      title: 'Offer Insurance',
      setting: [offerInsurance, (offerInsurance) => setOfferInsurance(offerInsurance)],
    },
    {
      title: 'Dealer Hits Soft 17',
      setting: [dealerHitSoft17, (dealerHitSoft17) => setDealerHitSoft17(dealerHitSoft17)],
    },
    {
      title: 'Show Running Count',
      setting: [showRunningCount, (showRunningCount) => setShowRunningCount(showRunningCount)],
    },
  ];

  const [isGameOngoing, setIsGameOngoing] = useState<boolean>(false);
  const [deck, setDeck] = useState<Deck>(null);

  useEffect(() => {
    // Get new deck
    if (!deck || (deck.RemainingCount < DECK_SIZE && !isGameOngoing)) {
      const newDeck = new Deck({ nDecks: NUM_DECKS });

      // Burn first card in deck
      log('Burning card');
      newDeck.draw(false);

      setDeck(newDeck);
      setRunningCount(0);
    }
  }, [deck, isGameOngoing]);

  const [dealer, setDealer] = useState<Hand>(null);
  const [currentHand, setCurrentHand] = useState<PlayerHand>(null);
  const [splitHands, setSplitHands] = useState<PlayerHand[]>([]);

  const [wager, setWager] = useState<number>(0);
  const [results, setResults] = useState<Results>(new Results({}));
  const [validDecisions, setValidDecisions] = useState<Decision[]>([]);
  const [runningCount, setRunningCount] = useState<number>(0);

  const [cancelTimeout, setCancelTimeout] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCurrentlyDealing, setIsCurrentlyDealing] = useState<boolean>(false);
  // const [isCurrentlyDealingTimeout, setIsCurrentlyDealingTimeout] = useState<boolean>(false);
  const [isDealerPlaying, setIsDealerPlaying] = useState<boolean>(false);
  const [isCurrentlyOfferingInsurance, setIsCurrentlyOfferingInsurance] = useState<boolean>(false);

  const [badDecision, setBadDecision] = useState<string>('');
  const [badDecisionCallback, setBadDecisionCallback] = useState<string>('');

  type KeyedFunctionType = {
    [key: string]: (response: boolean) => void;
  };
  const badDecisionPromptCallbacks: KeyedFunctionType = {
    hit: hit,
    stand: stand,
    doubleDown: doubleDown,
  };
  // const [isQuestioningBadDecision, setIsQuestioningBadDecision] = useState<boolean>(false);
  /* const [isQuestioningBadDecisionToHit, setIsQuestioningBadDecisionToHit] = useState<boolean>(false);
  const [isQuestioningBadDecisionToDouble, setIsQuestioningBadDecisionToDouble] = useState<boolean>(false);
  const [isQuestioningBadDecisionToStand, setIsQuestioningBadDecisionToStand] = useState<boolean>(false); */
  // const [badDecisionCallback, setBadDecisionCallback] = useState<(makeBadDecision: boolean) => void>(null);

  function onPromptResponse(response: boolean) {
    //, callback: (response: boolean) => void) {
    // log(`PROMPT RESPONSE =================== ${response}`);

    // setIsQuestioningBadDecision(false);
    /* setIsQuestioningBadDecisionToHit(false);
    setIsQuestioningBadDecisionToDouble(false);
    setIsQuestioningBadDecisionToStand(false); */

    if (response === true) {
      badDecisionPromptCallbacks[badDecisionCallback](true);
    }

    setIsProcessing(false);
    setBadDecision('');
    setBadDecisionCallback(null);
  }

  function drawCardAndUpdateDeck(flipCard: boolean = false): Card {
    const newDeck = deck.clone();
    const card = newDeck.draw(flipCard);
    setDeck(newDeck);
    return card;
  }

  /* function dealCardToCurrentHand(newCurrentHand: PlayerHand, flipCard: boolean = false): PlayerHand {
    const newDeck = deck.clone();
    const card = newDeck.draw(flipCard);
    newCurrentHand.addCard(card);

    setDeck(newDeck);

    if (flipCard) {
      setRunningCount(runningCount + card.CountValue);
    } else {
      // Delay flipping card and updating running count.
      setFlipLastCardTimeout(true);
    }

    return newCurrentHand;
  } */

  function rebetAndDeal() {
    log();
    log('rebetAndDeal');

    let newWager;
    if (results.hands.length > 0) {
      newWager = results.hands[results.hands.length - 1].OriginalWager;
    } else if (currentHand) {
      newWager = currentHand.OriginalWager;
    } else {
      newWager = wager;
    }

    deal(newWager);
  }

  function deal(wager: number) {
    log();
    log('Dealing');

    const card = drawCardAndUpdateDeck(true);
    const newCurrentHand = new PlayerHand({ wager });
    newCurrentHand.addCard(card);

    // setIsProcessing(true);
    setCurrentHand(newCurrentHand);
    setSplitHands([]);
    setDealer(new Hand({}));
    setWager(wager);
    setRunningCount(runningCount + card.CountValue);

    setCancelTimeout(false);
    setIsCurrentlyDealing(true);
    setIsGameOngoing(true);
  }

  const [dealerBlackjackNoInsurance, setDealerBlackjackNoInsurance] = useState<boolean>(false);
  useEffect(() => {
    // log(`dealerBlackjackNoInsurance:${dealerBlackjackNoInsurance}`);
    if (dealerBlackjackNoInsurance) {
      setTimeout(() => {
        // log('dealerBlackjackNoInsurance');
        // log('dealerBlackjackNoInsurance');
        // log('dealerBlackjackNoInsurance');
        if (!cancelTimeout) {
          insure(false);
        } else {
          setCancelTimeout(false);
        }

        setDealerBlackjackNoInsurance(false);
      }, DEFAULT_TIMEOUT);
    }
  });

  useEffect(() => {
    // Allow a short delay while dealing cards
    if (isCurrentlyDealing) {
      // && !isCurrentlyDealingTimeout) {
      if (dealer.cards.length === 0) {
        log('');
        // setIsCurrentlyDealingTimeout(true);

        setTimeout(() => {
          if (!cancelTimeout) {
            var time = new Date(Date.now());
            // log(`timer 1 finished: ${time.getMinutes()}.${time.getSeconds()}.${time.getMilliseconds()}`);

            const card = drawCardAndUpdateDeck(true); // show dealer first card
            const newDealer = dealer.clone();
            newDealer.addCard(card);

            setDealer(newDealer);
            setRunningCount(runningCount + card.CountValue);
            // setIsCurrentlyDealingTimeout(false);
          } else {
            setCancelTimeout(false);
          }
        }, DEFAULT_TIMEOUT);
      } else if (currentHand.cards.length === 1) {
        log('');
        // setIsCurrentlyDealingTimeout(true);

        setTimeout(() => {
          if (!cancelTimeout) {
            var time = new Date(Date.now());
            // log(`timer 2 finished: ${time.getMinutes()}.${time.getSeconds()}.${time.getMilliseconds()}`);

            const card = drawCardAndUpdateDeck(true);
            const newCurrentHand = currentHand.clone();
            newCurrentHand.addCard(card);

            setCurrentHand(newCurrentHand);
            setRunningCount(runningCount + card.CountValue);
            // setIsCurrentlyDealingTimeout(false);
          } else {
            setCancelTimeout(false);
          }
        }, DEFAULT_TIMEOUT);
      } else if (dealer.cards.length === 1) {
        log('');
        // setIsCurrentlyDealingTimeout(true);

        setTimeout(() => {
          if (!cancelTimeout) {
            var time = new Date(Date.now());
            // log(`timer 3 finished: ${time.getMinutes()}.${time.getSeconds()}.${time.getMilliseconds()}`);

            const card = drawCardAndUpdateDeck(false); // hide dealer second card
            const newDealer = dealer.clone();
            newDealer.addCard(card);

            setDealer(newDealer);

            // Check if player has blackjack
            // log('checking if player has blackjack');
            if (currentHand.IsBlackjack) {
              // Auto-stand on blackjack
              // log('player has blackjack');
              const newCurrentHand = currentHand.clone();
              newCurrentHand.stand();
              setCurrentHand(newCurrentHand);
            }

            const isCurrentlyOfferingInsurance = newDealer.cards[0].IsAce && offerInsurance;

            // Dealer not showing ace or offer insurance setting is turned off, but has blackjack
            // log(`!isCurrentlyOfferingInsurance:${!isCurrentlyOfferingInsurance}`);
            // log(`newDealer.IsBlackjack:${newDealer.IsBlackjack}`);
            if (!isCurrentlyOfferingInsurance && newDealer.IsBlackjack) {
              setDealerBlackjackNoInsurance(true);
            }

            setIsProcessing(isCurrentlyOfferingInsurance || newDealer.IsBlackjack);
            setIsCurrentlyOfferingInsurance(isCurrentlyOfferingInsurance);
            // setIsCurrentlyDealingTimeout(false);
          } else {
            setCancelTimeout(false);
          }
        }, DEFAULT_TIMEOUT);
      } else {
        setIsCurrentlyDealing(false);
      }
    }
  });

  function insure(accepted: boolean) {
    log('offering insurance');

    const newCurrentHand = currentHand.clone();
    if (accepted) {
      newCurrentHand.acceptInsurance();
    }

    // log('checking if dealer has blackjack');
    if (dealer.IsBlackjack) {
      // log('dealer has blackjack');
      const newDealer = dealer.clone();
      newDealer.cards[1].flip();

      newDealer.stand();
      newCurrentHand.stand();
      newCurrentHand.dealerHasBlackjack(); // record for insurance payout

      setDealer(newDealer);
      setRunningCount(runningCount + newDealer.cards[1].CountValue);
    }

    setCurrentHand(newCurrentHand);
    setIsProcessing(false);
    setIsCurrentlyOfferingInsurance(false);
  }

  function hit(makeBadDecision: boolean = false) {
    log();
    log('hit');

    // confirm bad decisions
    let newBadDecision = '';
    if (currentHand.ValueHard >= SEVENTEEN) {
      newBadDecision = `Hit hard ${currentHand.ValueHard}?`;
    } else if (currentHand.ValueSoft >= NINETEEN && currentHand.ValueSoft < TWENTY_ONE) {
      newBadDecision = `Hit soft ${currentHand.ValueSoft}?`;
    }

    // log(`makeBadDecision:${makeBadDecision}`);
    log(`${typeof makeBadDecision}`);
    log(`${makeBadDecision === false}`);
    if (makeBadDecision === true || newBadDecision === '') {
      const card = drawCardAndUpdateDeck(false);
      const newCurrentHand = currentHand.clone();
      newCurrentHand.addCard(card);

      setIsProcessing(true);
      setCurrentHand(newCurrentHand);
      setFlipLastCardTimeout(true);
      // setFlipLastCardTimeout(newCurrentHand);
    } else {
      // log(`BAD DECISION ===== ${newBadDecision}`);
      setIsProcessing(true);
      setBadDecision(newBadDecision);
      setBadDecisionCallback(hit.name);
      // setIsQuestioningBadDecisionToHit(true);
      // setBadDecisionCallback(() => hit(true));
    }
  }

  function stand(makeBadDecision: boolean) {
    log();
    log('stand');
    // log(`makeBadDecision:${makeBadDecision}`);
    // log(`typeof makeBadDecision:${typeof makeBadDecision}`);
    // log(`!currentHand.HasAce:${!currentHand.HasAce}`);
    // log(`currentHand.ValueHard < TWELVE:${currentHand.ValueHard < TWELVE}`);

    // confirm bad decisions
    let newBadDecision = '';
    if (!currentHand.HasAce && currentHand.ValueHard < TWELVE) {
      newBadDecision = `Stand on hard ${currentHand.ValueHard}?`;
    }

    if (makeBadDecision === true || newBadDecision === '') {
      const newCurrentHand = currentHand.clone();
      newCurrentHand.stand();
      setCurrentHand(newCurrentHand);
    } else {
      // log(`BAD DECISION ===== ${newBadDecision}`);
      setIsProcessing(true);
      setBadDecision(newBadDecision);
      setBadDecisionCallback(stand.name);
      // setIsQuestioningBadDecisionToStand(true);
      // setBadDecisionCallback(stand);
    }
  }

  function doubleDown(makeBadDecision: boolean = false) {
    log();
    log('doubleDown');

    // confirm bad decisions
    let newBadDecision = '';
    if (currentHand.ValueHard >= SEVENTEEN) {
      newBadDecision = `Double hard ${currentHand.ValueHard}?`;
    } else if (currentHand.ValueSoft >= NINETEEN && currentHand.ValueSoft < TWENTY_ONE) {
      newBadDecision = `Double soft ${currentHand.ValueSoft}?`;
    }

    if (makeBadDecision === true || newBadDecision === '') {
      const card = drawCardAndUpdateDeck(false);
      const newCurrentHand = currentHand.clone();
      newCurrentHand.doubleDown(card);

      setIsProcessing(true);
      setCurrentHand(newCurrentHand);
      setFlipLastCardTimeout(true);
      // setFlipLastCardTimeout(newCurrentHand);
    } else {
      log(`BAD DECISION ===== ${newBadDecision}`);
      setIsProcessing(true);
      setBadDecision(newBadDecision);
      setBadDecisionCallback(doubleDown.name);

      // setIsQuestioningBadDecisionToDouble(true);
      // setBadDecisionCallback(() => doubleDown(true));
    }
  }

  function split() {
    log();
    log('split');
    const newCurrentHand = currentHand.clone();
    const splitHand = newCurrentHand.split();

    setCurrentHand(newCurrentHand);
    setSplitHands([...splitHands, splitHand]);
  }

  function showResults() {
    log();
    log('showResults');
    results.display();
  }

  function redeal() {
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    log();
    /* if (isProcessing) {
      setIsProcessing(false);
      setCurrentlyOfferingInsurance(false);
      setCancelTimeout(true);
      rebetAndDeal()
    } else rebetAndDeal(); */
    setIsProcessing(false);
    setIsCurrentlyOfferingInsurance(false);
    setBadDecision('');
    setBadDecisionCallback(null);
    /* setIsQuestioningBadDecisionToHit(true);
    setIsQuestioningBadDecisionToDouble(true);
    setIsQuestioningBadDecisionToStand(true); */
    // setBadDecisionCallback(null);
    setCancelTimeout(true);
  }

  function autoHitSplitHand() {
    log();
    log('AUTO-HIT SPLIT HAND');
    const card = drawCardAndUpdateDeck(false);
    const newCurrentHand = currentHand.clone();
    newCurrentHand.addCard(card);

    // Auto-stand split aces but only if not dealt another ace
    if (newCurrentHand.cards[0].Rank === ACE && newCurrentHand.cards[1].Rank !== ACE) {
      // || newCurrentHand.IsTwentyOne) {
      log('AUTO-STAND SPLIT ACES');
      newCurrentHand.stand();
    }

    setIsProcessing(true);
    setCurrentHand(newCurrentHand);
    setFlipLastCardTimeout(true);
  }

  /* function setFlipLastCardTimeout(newCurrentHand: PlayerHand) {
    setTimeout(() => {
      if (!cancelTimeout) {
        const iCard = newCurrentHand.Cards.length - 1;
        newCurrentHand.flipCard(iCard);

        // Auto-stand on 21
        if (newCurrentHand.IsTwentyOne) {
          log('Auto-stand');
          newCurrentHand.stand();
        }

        setIsProcessing(false);
        setCurrentHand(newCurrentHand);
        setRunningCount(runningCount + newCurrentHand.Cards[iCard].CountValue);
      }
    }, DEFAULT_TIMEOUT);
  } */
  const [flipLastCardTimeout, setFlipLastCardTimeout] = useState<boolean>(false);
  useEffect(() => {
    if (flipLastCardTimeout) {
      setTimeout(() => {
        if (!cancelTimeout) {
          // log('flipLastCardTimeout');
          // log('flipLastCardTimeout');
          // log('flipLastCardTimeout');
          let newHand;
          if (isDealerPlaying) {
            newHand = dealer.clone();
          } else {
            newHand = currentHand.clone();
          }
          newHand.cards[newHand.cards.length - 1].flip();

          // Auto-stand on 21
          if (newHand.IsTwentyOne) {
            log('Auto-stand');
            newHand.stand();
          }

          setIsProcessing(false);
          if (isDealerPlaying) {
            setDealer(newHand);
          } else {
            setCurrentHand(newHand);
          }
          setRunningCount(runningCount + newHand.cards[newHand.cards.length - 1].CountValue);
        } else {
          setCancelTimeout(false);
        }

        setFlipLastCardTimeout(false);
      }, DEFAULT_TIMEOUT);
    }
  }, [cancelTimeout, currentHand, dealer, flipLastCardTimeout, isDealerPlaying, runningCount]);

  const [newCurrentHandTimeout, setNewCurrentHandTimeout] = useState<boolean>(false);
  useEffect(() => {
    if (newCurrentHandTimeout) {
      setTimeout(() => {
        if (!cancelTimeout) {
          // log('newCurrentHandTimeout');
          // log('newCurrentHandTimeout');
          // log('newCurrentHandTimeout');
          getNewCurrentHand();
        } else {
          setCancelTimeout(false);
        }

        setNewCurrentHandTimeout(false);
      }, DEFAULT_TIMEOUT);
    }
  });

  function getNewCurrentHand() {
    // log('New current hand exists, updating current hand to next active hand');
    const newSplitHands = [...splitHands];

    // Swap current hand with first split hand that didnt stand or bust
    const iFirstNewHand = newSplitHands.findIndex((x) => !x.didStand && !x.IsBust);
    const newCurrentHand = newSplitHands[iFirstNewHand];
    newSplitHands[iFirstNewHand] = currentHand;

    setSplitHands(newSplitHands);
    setCurrentHand(newCurrentHand);
  }

  // Dealer plays
  useEffect(() => {
    if (isDealerPlaying && !flipLastCardTimeout && !isProcessing) {
      setIsProcessing(true);
      setTimeout(() => {
        if (!cancelTimeout) {
          // log('Dealer plays');
          const newDealer = dealer.clone();
          const allHands = [...splitHands, currentHand];
          const dealerWillHit =
            (dealer.ValueHard < SEVENTEEN && (dealer.ValueSoft < SEVENTEEN || dealer.ValueSoft > TWENTY_ONE)) || // dealer under 17 or
            (dealerHitSoft17 && // dealer hit soft 17 and
              dealer.HasAce &&
              dealer.ValueSoft === SEVENTEEN &&
              allHands.some((x) => x.BestValue >= SEVENTEEN)); // some hands with 17 or more

          if (dealerWillHit) {
            const card = drawCardAndUpdateDeck(false);
            newDealer.addCard(card);

            // log(`Dealer dealt card ${card.toString()}`);
            // log(
            //   `\tdealer hand:\t${newDealer.toString()} ${newDealer.IsBlackjack ? 'BLACKJACK' : newDealer.ValueString}`
            // );

            setIsProcessing(true);
            setDealer(newDealer);
            setFlipLastCardTimeout(true);
          } else {
            log('Dealer stands');
            newDealer.stand();
            setDealer(newDealer);
            setIsDealerPlaying(false);
          }
        } else {
          setCancelTimeout(false);
        }

        setIsProcessing(false);
      }, DEFAULT_TIMEOUT);
    }
  });

  useEffect(() => {
    // log();
    // log('|=============== BEGIN componentDidUpdate BEGIN ===============|');
    // log(`splitHands.length:${splitHands.length}`);

    if (currentHand && !isCurrentlyDealing) {
      // DEBUG: display all active hands
      // log(`\tCurrent Hand:\t${currentHand}  -  ${currentHand.IsBlackjack ? 'BLACKJACK' : currentHand.ValueString}`);
      splitHands.forEach((x, i) => log(`\t Split Hand ${i}:\t${x}  -  ${x.IsBlackjack ? 'BLACKJACK' : x.ValueString}`));

      // Dealing completed and no active prompts.
      // log(`dealer: ${dealer}`);
      // log(`!isProcessing: ${!isProcessing}`);
      if (dealer && !isProcessing) {
        // Auto-hit on split hands
        if (currentHand.didSplit && currentHand.cards.length === 1) {
          autoHitSplitHand();
        }

        // Current hand is done
        else if (currentHand.didStand || currentHand.IsBust) {
          // New current hand exists
          if (splitHands.some((x) => !x.didStand && !x.IsBust)) {
            if (!currentHand.IsBust) {
              getNewCurrentHand();
            } else if (!newCurrentHandTimeout) {
              setNewCurrentHandTimeout(true);
            }
          }

          // All active hands either stood or busted
          else {
            const allHands = [...splitHands, currentHand];
            // log('All active hands either stood or busted');
            // Flip second dealer card before playing
            if (!dealer.cards[1].isFaceUp) {
              // log('flipping dealer first card');
              const newDealer = dealer.clone();
              newDealer.cards[1].flip(); // show dealer second card

              setDealer(newDealer);
              setRunningCount(runningCount + newDealer.cards[1].CountValue);
            }

            // Dealer plays
            else if (!dealer.didStand && allHands.some((x) => !x.IsBlackjack && !x.IsBust)) {
              // Wait on timeout
              if (!isDealerPlaying) {
                setIsDealerPlaying(true);
              }
            }

            // Calculate results
            else if (allHands.some((x) => x.result === HandResult.InProgress)) {
              const newResults = results.clone();

              const newSplitHands = [...splitHands, currentHand].map((hand, i) => {
                log();
                log();
                log();
                log();
                log();
                log();
                log();
                log();
                log();
                log();
                log();
                log('Results');

                const newHand = hand.clone();
                newHand.calculateResult(dealer);
                newResults.recordHand(newHand);

                log(`Hand ${i + 1} `);
                if (newHand.IsWin) {
                  if (newHand.result == HandResult.WinByBlackjack) log('BLACKJACK');
                  else log('WINNER WINNER');
                } else if (newHand.IsLoss) log('DEALER WINS');
                else log('PUSH');

                log();
                log(`\tDealer:\t\t${dealer.toString()} ${dealer.IsBlackjack ? 'BLACKJACK' : dealer.ValueString}`);
                log(`\tYour Hand:\t${newHand} ${newHand.IsBlackjack ? 'BLACKJACK' : newHand.ValueString}`);
                log(`\tWager:\t\t${newHand.wager}`);
                log(`\tPayout:\t\t${newHand.Payout}\n`);
                log();

                return newHand;
              });

              setCurrentHand(newSplitHands.pop());
              setSplitHands(newSplitHands);
              setResults(newResults);
              setIsGameOngoing(false);
            }
          }
        }
      }

      // Update valid decisions
      const newValidDecisions = Object.values(Decision).filter((x) => currentHand.isDecisionValid(x));
      if (!isArrayEqual(newValidDecisions, validDecisions)) {
        setValidDecisions(newValidDecisions);
      }
    }

    // log('|=============== END componentDidUpdate END ===============|');
    // log();
  });

  return (
    <Layout
      title="Blackjack"
      favicon="/favicon.blackjack.ico"
      openSettings={() => setIsSettingsOpen(true)}
      disabled={isSettingsOpen}
    >
      <Prompt promptText={'INSURANCE?'} respond={insure} isPromptActive={isCurrentlyOfferingInsurance} />
      <Prompt promptText={badDecision} respond={onPromptResponse} isPromptActive={badDecision !== ''} />
      {isSettingsOpen && <Settings configs={settingsConfigs} onClose={closeSettings} />}
      <div className={`column container outline ${styles.table}`}>
        <div id="dealer" className="twenty column outline">
          {dealer && <HandComponent hand={dealer} isDealer={true} />}
        </div>

        {currentHand ? (
          <>
            <div id="center" className="forty column outline" style={{ position: 'relative' }}>
              {splitHands.length > 0 && (
                <div className="whole row wrap outline" style={{ justifyContent: 'space-around' }}>
                  {splitHands.map((x, i) => (
                    <div
                      key={`splitHand-${i}`}
                      className="column"
                      style={{
                        width: 'calc(100% / 3 - 2em)',
                        margin: '0 1em 0 1em',
                      }}
                    >
                      <HandComponent hand={x} isDealer={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              id="playerHand"
              className="twentyFive row outline"
              style={{ justifyContent: 'space-around', alignItems: 'center' }}
            >
              <div className="quarter column outline">
                {showRunningCount && (
                  <Panel
                    info={['Count:', `${runningCount > 0 ? '+' : ''}${runningCount}`]}
                    style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
                  />
                )}
              </div>
              <div className="half column outline" style={{ alignContent: 'flex-end' }}>
                {currentHand && (
                  <>
                    <HandComponent hand={currentHand} isDealer={false} />
                    <Panel
                      info={[`$${currentHand.wager.toLocaleString('en-US')}`]}
                      style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
                    />
                  </>
                )}
              </div>
              <div className="quarter column outline"></div>
            </div>
            <div id="bottomPane" className="fifteen column outline">
              <div
                id="choices"
                className="half row outline"
                style={{ justifyContent: 'center', alignItems: 'flex-end' }}
              >
                {currentHand.result === HandResult.InProgress
                  ? [
                      {
                        text: 'Double Down',
                        handler: () => doubleDown(false),
                        decision: Decision.DoubleDown,
                        disabled: false,
                      },
                      { text: 'Split', handler: split, decision: Decision.Split, disabled: splitHands.length === 6 },
                      { text: 'Stand', handler: () => stand(false), decision: Decision.Stand, disabled: false },
                      { text: 'Hit', handler: hit, decision: Decision.Hit, disabled: false },
                    ].map(({ text, handler, decision, disabled }) => (
                      <SexyButton
                        key={text}
                        text={text}
                        onClick={handler}
                        disabled={
                          disabled ||
                          isProcessing ||
                          badDecision !== '' ||
                          !currentHand.isDecisionValid(decision) ||
                          !dealer.WasDealtCards ||
                          isSettingsOpen
                        }
                      />
                    ))
                  : [
                      {
                        text: 'Change Bet',
                        handler: () => {
                          setDealer(null);
                          setSplitHands([]);
                          setCurrentHand(null);
                        },
                      },
                      { text: 'Rebet & Deal', handler: rebetAndDeal },
                    ].map(({ text, handler }) => (
                      <SexyButton key={text} text={text} onClick={handler} disabled={isSettingsOpen} />
                    ))}
              </div>
              <div className="half row outline" style={{ justifyContent: 'center' }}>
                {/* <Button onClick={showResults} variant="contained" size="small" style={{ margin: '1em' }}>
                Results
              </Button> */}
                <Panel
                  info={['Total:', `$${results.TotalNetWinnings.toLocaleString('en-US')}`]}
                  style={{ margin: '1em' }}
                />
                <Panel
                  info={['Current:', `$${results.CurrentNetWinnings.toLocaleString('en-US')}`]}
                  style={{ margin: '1em' }}
                />
                {/* <Button onClick={redeal} variant="contained" size="small" style={{ margin: '1em' }}>
                Redeal
              </Button> */}
              </div>
            </div>
          </>
        ) : (
          <ChipSelector deal={deal} disabled={isSettingsOpen} />
        )}
      </div>
    </Layout>
  );
}
