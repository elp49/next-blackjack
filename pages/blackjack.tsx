import { getCookie, hasCookie } from 'cookies-next';
import React from 'react';
import Deck from '../classes/Deck';
import Hand, { HandResult } from '../classes/Hand';
import PlayerHand, { Decision } from '../classes/PlayerHand';
import Results from '../classes/Results';
import ChipSelector from '../components/ChipSelector';
import Layout from '../components/Layout/Layout';
import Settings from '../components/Layout/Settings';
import Panel from '../components/Panel';
import Prompt from '../components/Prompt';
import SexyButton from '../components/SexyButton';
import styles from '../styles/table.module.css';
import { ACE, DECK_SIZE, NINETEEN, SEVENTEEN, TWELVE, TWENTY_ONE } from '../utils/constants';
import { isArrayEqual } from '../utils/utils';

// import { AppSettings } from './_app';

const NUM_DECKS = 6;
// const HIT_SOFT_SEVENTEEN = true;

// const DEFAULT_TIMEOUT = 100;
const DEFAULT_TIMEOUT = 500;

const COOKIE_OFFER_INSURANCE = 'offerInsurance';
const COOKIE_SOFT_SEVENTEEN = 'dealerHitSoft17';
const COOKIE_SHOW_COUNT = 'showCount';

export interface IBlackjackProps {
  // appSettings: AppSettings;
}

export interface IBlackjackState {
  isSettingsOpen: boolean;
  offerInsurance: boolean;
  dealerHitSoft17: boolean;
  showRunningCount: boolean;

  dealer: Hand;
  currentHand: PlayerHand;
  validDecisions: Decision[];
  currentlyOfferingInsurance: boolean;
  isProcessing: boolean;
  isDealerPlaying: boolean;
  badDecision: string;
  isQuestioningBadDecisionToHit: boolean;
  isQuestioningBadDecisionToDouble: boolean;
  isQuestioningBadDecisionToStand: boolean;
  cancelTimeout: boolean;
  count: number;
}

class Blackjack extends React.Component<IBlackjackProps, IBlackjackState> {
  results: Results;
  deck: Deck;
  activeHands: PlayerHand[];
  wager: number;

  constructor(props) {
    super(props);

    this.state = {
      isSettingsOpen: false,
      offerInsurance: true,
      dealerHitSoft17: false,
      showRunningCount: false,

      dealer: null,
      currentHand: null,
      validDecisions: [Decision.PlaceBet],
      currentlyOfferingInsurance: false,
      isProcessing: false,
      isDealerPlaying: false,
      badDecision: '',
      isQuestioningBadDecisionToHit: false,
      isQuestioningBadDecisionToDouble: false,
      isQuestioningBadDecisionToStand: false,
      cancelTimeout: false,
      count: 0,
    };

    this.results = new Results();
    this.deck = null;
    this.activeHands = [];

    this.rebetAndDeal = this.rebetAndDeal.bind(this);
    this.deal = this.deal.bind(this);
    this.insure = this.insure.bind(this);
    this.badDecisionResponse = this.badDecisionResponse.bind(this);
    this.hit = this.hit.bind(this);
    this.stand = this.stand.bind(this);
    this.doubleDown = this.doubleDown.bind(this);
    this.split = this.split.bind(this);
    this.showResults = this.showResults.bind(this);
    this.redeal = this.redeal.bind(this);
    this.autoHitSplitHand = this.autoHitSplitHand.bind(this);
  }

  rebetAndDeal() {
    console.log();
    console.log('rebetAndDeal');
    let wager;

    if (this.results.hands.length > 0) {
      wager = this.results.hands[this.results.hands.length - 1].OriginalWager;
    } else if (this.state.currentHand) {
      wager = this.state.currentHand.OriginalWager;
    } else {
      wager = this.wager;
    }

    this.deal(wager);
  }

  deal(wager: number) {
    console.log();
    console.log('Dealing');

    this.wager = wager;
    const currentHand = new PlayerHand({ wager });
    const dealer = new Hand({ isDealer: true });
    let count = this.state.count;

    // Get new deck
    if (!this.deck || this.deck.RemainingCount < DECK_SIZE) {
      this.deck = new Deck(NUM_DECKS);
      count = 0;

      // Burn first card in deck
      console.log('Burning card');
      this.deck.draw(false);
    }

    // Deal cards
    const card = this.deck.draw();
    currentHand.addCard(card);
    count += card.CountValue;

    this.activeHands = [currentHand];
    this.setState({ isProcessing: true, cancelTimeout: false, currentHand, dealer, count }, () => {
      setTimeout(() => {
        if (!this.state.cancelTimeout) {
          const dealer = this.state.dealer.clone();
          dealer.addCard(this.deck.draw(false)); // hide dealer first card

          this.setState({ dealer }, () => {
            setTimeout(() => {
              if (!this.state.cancelTimeout) {
                const currentHand = this.state.currentHand.clone();
                const card = this.deck.draw();
                currentHand.addCard(card);
                this.activeHands = [currentHand];
                count += card.CountValue;

                this.setState({ currentHand, count }, () => {
                  setTimeout(() => {
                    if (!this.state.cancelTimeout) {
                      const dealer = this.state.dealer.clone();
                      const card = this.deck.draw();
                      dealer.addCard(card); // show dealer second card
                      count += card.CountValue;

                      this.setState({ dealer, count }, () => {
                        const currentlyOfferingInsurance =
                          this.state.dealer.cards[1].IsAce && this.state.offerInsurance;

                        // Check if player has blackjack
                        console.log('checking if player has blackjack');
                        if (this.state.currentHand.IsBlackjack) {
                          console.log('player has blackjack');
                          const currentHand = this.state.currentHand.clone();
                          currentHand.stand();

                          const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
                          this.activeHands[iCurrentHand] = currentHand;

                          this.setState({ currentHand });
                        } else {
                          console.log('nope');
                        }

                        this.setState(
                          {
                            isProcessing: currentlyOfferingInsurance || this.state.dealer.IsBlackjack,
                            currentlyOfferingInsurance,
                          },
                          () => {
                            // Dealer not showing ace or offer insurance setting is turned off, but has blackjack
                            if (!currentlyOfferingInsurance && this.state.dealer.IsBlackjack) {
                              this.insure(false);
                            }
                          }
                        );
                      });
                    } else {
                      this.setState({ cancelTimeout: false });
                    }
                  }, DEFAULT_TIMEOUT);
                });
              } else {
                this.setState({ cancelTimeout: false });
              }
            }, DEFAULT_TIMEOUT);
          });
        } else {
          this.setState({ cancelTimeout: false });
        }
      }, DEFAULT_TIMEOUT);
    });
  }

  insure(accepted: boolean) {
    console.log('offering insurance');

    const currentHand = this.state.currentHand.clone();
    if (accepted) {
      currentHand.acceptInsurance();
      this.activeHands = [currentHand];
      this.setState({
        currentHand,
      });
    }

    console.log('checking if dealer has blackjack');
    if (this.state.dealer.IsBlackjack) {
      console.log('dealer has blackjack');
      const dealer = this.state.dealer.clone();
      dealer.cards[0].flip();
      dealer.stand();
      currentHand.stand();
      const count = this.state.count + dealer.cards[0].CountValue;

      this.activeHands = [currentHand];
      this.setState({
        isProcessing: false,
        currentlyOfferingInsurance: false,
        dealer,
        currentHand,
        count,
      });
    }

    this.setState({
      isProcessing: false,
      currentlyOfferingInsurance: false,
    });
  }

  badDecisionResponse(makeBadDecision: boolean, callback: () => void) {
    console.log(
      `BAD DECISION RESPoNSE =================== ${makeBadDecision ? 'livin life on the edge' : 'playin it safe'}`
    );
    this.setState(
      {
        isProcessing: false,
        badDecision: '',
        isQuestioningBadDecisionToHit: false,
        isQuestioningBadDecisionToDouble: false,
        isQuestioningBadDecisionToStand: false,
      },
      () => {
        if (makeBadDecision) {
          callback();
        }
      }
    );
  }

  hit(makeBadDecision: boolean) {
    console.log();
    console.log('hit');

    // confirm bad decisions
    let badDecision = '';
    if (this.state.currentHand.ValueHard >= SEVENTEEN) {
      badDecision = `Hit hard ${this.state.currentHand.ValueHard}?`;
    } else if (this.state.currentHand.ValueSoft >= NINETEEN && this.state.currentHand.ValueSoft < TWENTY_ONE) {
      badDecision = `Hit soft ${this.state.currentHand.ValueSoft}?`;
    }

    if (!makeBadDecision && badDecision !== '') {
      console.log(`BAD DECISION ===== ${badDecision}`);
      this.setState({ isProcessing: true, badDecision, isQuestioningBadDecisionToHit: true });
    } else {
      const currentHand = this.state.currentHand.clone();

      console.log('current hand:');
      console.log(currentHand.toString());
      console.log('active hands:');
      this.activeHands.forEach((x) => console.log(x.toString()));

      currentHand.addCard(this.deck.draw(false));

      const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
      this.activeHands[iCurrentHand] = currentHand;
      this.setState(
        {
          isProcessing: true,
          currentHand,
        },
        () => {
          console.log('current hand:');
          console.log(currentHand.toString());
          console.log('active hands:');
          this.activeHands.forEach((x) => console.log(x.toString()));

          setTimeout(() => {
            const iCard = currentHand.cards.length - 1;
            currentHand.cards[iCard].flip();
            const count = this.state.count + currentHand.cards[iCard].CountValue;

            // Auto-stand
            if (currentHand.IsTwentyOne) {
              console.log('Auto-stand');
              currentHand.stand();

              // Log hands
              /* console.log(currentHand.toString());
                console.log('active hands:');
                this.activeHands.forEach((x) => console.log(x.toString())); */

              const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
              this.activeHands[iCurrentHand] = currentHand;
            }

            this.setState({
              isProcessing: false,
              currentHand,
              count,
            });
          }, DEFAULT_TIMEOUT);
        }
      );
    }
  }

  stand(makeBadDecision: boolean) {
    console.log();
    console.log('stand');

    // confirm bad decisions
    let badDecision = '';
    if (!this.state.currentHand.HasAce && this.state.currentHand.ValueHard < TWELVE) {
      badDecision = `Stand on hard ${this.state.currentHand.ValueHard}?`;
    }

    if (!makeBadDecision && badDecision !== '') {
      console.log(`BAD DECISION ===== ${badDecision}`);
      this.setState({ isProcessing: true, badDecision, isQuestioningBadDecisionToStand: true });
    } else {
      const currentHand = this.state.currentHand.clone();
      currentHand.stand();

      console.log('current hand:');
      console.log(currentHand.toString());
      console.log('active hands:');
      this.activeHands.forEach((x) => console.log(x.toString()));

      const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
      console.log(`iCurrentHand: ${iCurrentHand}`);
      this.activeHands[iCurrentHand] = currentHand;

      this.setState({ currentHand });
    }
  }

  doubleDown(makeBadDecision: boolean) {
    console.log();
    console.log('doubleDown');

    // confirm bad decisions
    let badDecision = '';
    if (this.state.currentHand.ValueHard >= SEVENTEEN) {
      badDecision = `Double hard ${this.state.currentHand.ValueHard}?`;
    } else if (this.state.currentHand.ValueSoft >= NINETEEN && this.state.currentHand.ValueSoft < TWENTY_ONE) {
      badDecision = `Double soft ${this.state.currentHand.ValueSoft}?`;
    }

    if (!makeBadDecision && badDecision !== '') {
      console.log(`BAD DECISION ===== ${badDecision}`);
      this.setState({ isProcessing: true, badDecision, isQuestioningBadDecisionToDouble: true });
    } else {
      const currentHand = this.state.currentHand.clone();
      const card = this.deck.draw();
      currentHand.doubleDown(card);
      const count = this.state.count + card.CountValue;

      const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
      this.activeHands[iCurrentHand] = currentHand;

      this.setState({ currentHand, count });
    }
  }

  split() {
    console.log();
    console.log('split');
    const currentHand = this.state.currentHand.clone();
    const splitHand = currentHand.split();
    this.activeHands.push(splitHand);

    const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
    this.activeHands[iCurrentHand] = currentHand;

    this.setState({ currentHand });
  }

  showResults = () => {
    console.log();
    console.log('showResults');
    this.results.Display();
  };

  redeal = () => {
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    console.log();
    /* if (this.state.isProcessing) {
      this.setState(
        {
          isProcessing: false,
          currentlyOfferingInsurance: false,
          cancelTimeout: true,
        },
        this.rebetAndDeal
      );
    } else this.rebetAndDeal(); */
    this.setState(
      {
        isProcessing: false,
        currentlyOfferingInsurance: false,
        cancelTimeout: true,
      },
      this.rebetAndDeal
    );
  };

  autoHitSplitHand() {
    console.log();
    console.log('AUTO-HIT SPLIT HAND');
    const currentHand = this.state.currentHand.clone();
    const card = this.deck.draw();
    currentHand.addCard(card);
    const count = this.state.count + card.CountValue;

    // Auto-stand 21 or split aces but only if not dealt another ace
    if ((currentHand.cards[0].Rank === ACE && currentHand.cards[1].Rank !== ACE) || currentHand.IsTwentyOne) {
      console.log('AUTO-STAND 21 or SPLIT ACES');
      currentHand.stand();
    }

    const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
    this.activeHands[iCurrentHand] = currentHand;

    this.setState({ currentHand, count });
  }

  componentDidMount(): void {
    // Bootstrap cookies
    if (hasCookie(COOKIE_OFFER_INSURANCE)) {
      const offerInsurance = getCookie(COOKIE_OFFER_INSURANCE) as boolean;
      this.setState({
        offerInsurance,
      });
    }

    if (hasCookie(COOKIE_SOFT_SEVENTEEN)) {
      const dealerHitSoft17 = getCookie(COOKIE_SOFT_SEVENTEEN) as boolean;
      this.setState({
        dealerHitSoft17,
      });
    }

    if (hasCookie(COOKIE_SHOW_COUNT)) {
      const showRunningCount = getCookie(COOKIE_SHOW_COUNT) as boolean;
      this.setState({
        showRunningCount,
      });
    }
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<IBlackjackState>, snapshot?: any): void {
    console.log();
    console.log('|=============== BEGIN componentDidUpdate BEGIN ===============|');

    // Update props
    if (prevProps && this.props)
      if (this.state.currentHand) {
        // DEBUG: display all active hands
        this.activeHands.forEach((x, i) =>
          console.log(`\tHand ${i}:\t${x} ${x.IsBlackjack ? 'BLACKJACK' : x.ValueString}`)
        );

        // Dealing completed and no active prompts.
        if (this.state.dealer && !this.state.isProcessing) {
          // Auto-hit on split hands
          if (this.state.currentHand.didSplit && this.state.currentHand.cards.length === 1) {
            this.autoHitSplitHand();
          }

          // New current hand exists
          else if (
            (this.state.currentHand.didStand || this.state.currentHand.IsBust) &&
            this.activeHands.some((x) => !x.didStand && !x.IsBust)
          ) {
            console.log('New current hand exists, updating current hand to next active hand');
            const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
            console.log(`iCurrentHand: ${iCurrentHand}`);

            if (iCurrentHand === -1) console.log('activehands is outdated, you fucked up');
            else {
              console.log('moving to next current hand...');
              const currentHand = this.activeHands[iCurrentHand + 1];
              this.setState({ currentHand });
            }
          }

          // All active hands either stood or busted
          else if (!this.activeHands.some((x) => !x.didStand && !x.IsBust)) {
            console.log('All active hands either stood or busted');
            // Flip first dealer card before playing
            if (!this.state.dealer.cards[0].isFaceUp) {
              console.log('flipping dealer second card');
              const dealer = this.state.dealer.clone();
              dealer.cards[0].flip(); // show dealer first card
              const count = this.state.count + dealer.cards[0].CountValue;
              this.setState({ dealer, count });
            }

            // Dealer plays
            else if (!this.state.dealer.didStand && this.activeHands.some((x) => !x.IsBlackjack && !x.IsBust)) {
              if (!this.state.isDealerPlaying) {
                console.log('Dealer plays');
                const dealer = this.state.dealer.clone();
                let count = this.state.count;
                const dealerWillHit =
                  (dealer.ValueHard < SEVENTEEN && (dealer.ValueSoft < SEVENTEEN || dealer.ValueSoft > TWENTY_ONE)) || // dealer under 17 or
                  (this.state.dealerHitSoft17 && // dealer hit soft 17 and
                    dealer.HasAce &&
                    dealer.ValueSoft === SEVENTEEN &&
                    this.activeHands.some((x) => x.BestValue >= SEVENTEEN)); // some hands with 17 or more
                if (dealerWillHit) {
                  const card = this.deck.draw();
                  console.log(`Dealer dealt card ${card.toString()}`);
                  dealer.addCard(card);
                  console.log(
                    `\tdealer hand:\t${dealer.toString()} ${dealer.IsBlackjack ? 'BLACKJACK' : dealer.ValueString}`
                  );
                  count += card.CountValue;
                } else {
                  console.log('Dealer stands');
                  dealer.stand();
                }

                this.setState(
                  {
                    isDealerPlaying: true, // prevent dealer from hitting again before timeout ends
                  },
                  () => {
                    setTimeout(() => {
                      this.setState({ dealer, count, isDealerPlaying: false });
                    }, DEFAULT_TIMEOUT);
                  }
                );
              }
            }

            // Calculate results
            else if (this.activeHands.some((x) => x.result === HandResult.InProgress)) {
              this.activeHands.forEach((hand, i) => {
                console.log();
                console.log('Results');

                hand.calculateResult(this.state.dealer);
                this.results.RecordHand(hand);
                if (i === this.activeHands.length - 1) {
                  this.setState({ currentHand: hand });
                }

                console.log(`Hand ${i + 1} `);
                if (hand.IsWin) {
                  if (hand.result == HandResult.WinByBlackjack) console.log('BLACKJACK');
                  else console.log('WINNER WINNER');
                } else if (hand.IsLoss) console.log('DEALER WINS');
                else console.log('PUSH');

                console.log();
                console.log(
                  `\tDealer:\t\t${this.state.dealer.toString()} ${
                    this.state.dealer.IsBlackjack ? 'BLACKJACK' : this.state.dealer.ValueString
                  }`
                );
                console.log(`\tYour Hand:\t${hand} ${hand.IsBlackjack ? 'BLACKJACK' : hand.ValueString}`);
                console.log(`\tWager:\t\t${hand.wager}`);
                console.log(`\tPayout:\t\t${hand.Payout}\n`);
                console.log();
              });
            }
          }
        }

        // Update valid decisions
        const validDecisions = Object.values(Decision).filter((x) => this.state.currentHand.isDecisionValid(x));
        if (!isArrayEqual(validDecisions, prevState.validDecisions)) {
          this.setState({
            validDecisions,
          });
        }
      }
    console.log('|=============== END componentDidUpdate END ===============|');
    console.log();
  }

  render() {
    return (
      <Layout openSettings={() => this.setState({ isSettingsOpen: true })} disabled={this.state.isSettingsOpen}>
        {this.state.isSettingsOpen && (
          <Settings
            configs={[
              {
                title: 'Offer Insurance',
                setting: [this.state.offerInsurance, (offerInsurance) => this.setState({ offerInsurance })],
              },
              {
                title: 'Dealer Hits Soft 17',
                setting: [this.state.dealerHitSoft17, (dealerHitSoft17) => this.setState({ dealerHitSoft17 })],
              },
              {
                title: 'Show Running Count',
                setting: [this.state.showRunningCount, (showRunningCount) => this.setState({ showRunningCount })],
              },
            ]}
            onClose={() => this.setState({ isSettingsOpen: false })}
          />
        )}
        <div className={`column container outline ${styles.table}`}>
          <div id="dealer" className="twenty column outline">
            {this.state.dealer && this.state.dealer.render()}
          </div>

          {this.state.currentHand ? (
            <>
              <div id="center" className="forty column outline">
                <Prompt
                  promptText="INSURANCE?"
                  respond={this.insure}
                  isPromptActive={this.state.currentlyOfferingInsurance}
                />
                <Prompt
                  promptText={this.state.badDecision}
                  respond={(response: boolean) => this.badDecisionResponse(response, () => this.hit(true))}
                  isPromptActive={this.state.isQuestioningBadDecisionToHit}
                />
                <Prompt
                  promptText={this.state.badDecision}
                  respond={(response: boolean) => this.badDecisionResponse(response, () => this.doubleDown(true))}
                  isPromptActive={this.state.isQuestioningBadDecisionToDouble}
                />
                <Prompt
                  promptText={this.state.badDecision}
                  respond={(response: boolean) => this.badDecisionResponse(response, () => this.stand(true))}
                  isPromptActive={this.state.isQuestioningBadDecisionToStand}
                />
                {this.activeHands.length > 0 && (
                  <div className="whole row wrap outline" style={{ justifyContent: 'space-around' }}>
                    {this.activeHands
                      .filter((x) => x !== this.state.currentHand)
                      .map((x, i) => (
                        <div key={`activeHand-${i}`} className="column" style={{ margin: '0 1em 0 1em' }}>
                          {x.render()}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div
                id="playerHand"
                className="twenty row outline"
                style={{ justifyContent: 'space-around', alignItems: 'center' }}
              >
                <div className="quarter column outline">
                  {this.state.showRunningCount && (
                    <Panel
                      info={['Count:', `${this.state.count > 0 ? '+' : ''}${this.state.count}`]}
                      style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
                    />
                  )}
                </div>
                <div className="half column outline">
                  {this.state.currentHand && this.state.currentHand.WasDealtCards && (
                    <>
                      {this.state.currentHand.render()}
                      <Panel
                        info={[`$${this.state.currentHand.wager}`]}
                        style={{ paddingLeft: '0.5em', paddingRight: '0.5em' }}
                      />
                    </>
                  )}
                </div>
                <div className="quarter column outline"></div>
              </div>
              <div id="bottomPane" className="twenty column outline">
                <div
                  id="choices"
                  className="half row outline"
                  style={{ justifyContent: 'center', alignItems: 'flex-end' }}
                >
                  {this.state.currentHand.result === HandResult.InProgress
                    ? [
                        { text: 'Double Down', handler: () => this.doubleDown(false), decision: Decision.DoubleDown },
                        { text: 'Split', handler: this.split, decision: Decision.Split },
                        { text: 'Stand', handler: () => this.stand(false), decision: Decision.Stand },
                        { text: 'Hit', handler: () => this.hit(false), decision: Decision.Hit },
                      ].map(({ text, handler, decision }) => {
                        const isDisabled =
                          this.state.isProcessing ||
                          this.state.currentlyOfferingInsurance ||
                          !this.state.currentHand.isDecisionValid(decision) ||
                          this.state.isSettingsOpen;
                        return <SexyButton key={text} text={text} onClick={handler} disabled={isDisabled} />;
                      })
                    : [
                        {
                          text: 'Change Bet',
                          handler: () => this.setState({ dealer: null, currentHand: null }),
                        },
                        { text: 'Rebet & Deal', handler: this.rebetAndDeal },
                      ].map(({ text, handler }) => {
                        const isDisabled = this.state.isSettingsOpen;
                        return (
                          <SexyButton
                            key={text}
                            text={text}
                            onClick={handler}
                            disabled={isDisabled}
                            /* style={{
                            height: '4em',
                            width: '10em',
                            padding: 0,
                            margin: '1em',
                          }} */
                          />
                        );
                      })}
                </div>
                <div className="half row outline" style={{ justifyContent: 'center' }}>
                  {/* <Button onClick={this.showResults} variant="contained" size="small" style={{ margin: '1em' }}>
                  Results
                </Button> */}
                  <Panel info={['Total:', `$${this.results.TotalNetWinnings}`]} style={{ margin: '1em' }} />
                  <Panel info={['Current:', `$${this.results.CurrentNetWinnings}`]} style={{ margin: '1em' }} />
                  {/* <Button onClick={this.redeal} variant="contained" size="small" style={{ margin: '1em' }}>
                  Redeal
                </Button> */}
                </div>
              </div>
            </>
          ) : (
            <ChipSelector deal={this.deal} disabled={this.state.isSettingsOpen} />
          )}
        </div>
      </Layout>
    );
  }
}

export default Blackjack;
