import { Component, useEffect, useState } from 'react';
import { getRandomInt, range } from '../utils/utils';
import Layout from '../components/Layout/Layout';
import { Button, iconButtonClasses } from '@mui/material';
import Script from 'next/script';
import React from 'react';
import Deck from '../classes/Deck';
import PlayerHand, { Decision } from '../classes/PlayerHand';
import Results from '../classes/Results';
import { ACE, DECK_SIZE, SEVENTEEN } from '../utils/constants';
import Hand, { HandResult } from '../classes/Hand';
import styles from '../styles/table.module.css';

const NUM_DECKS = 2;
const HIT_SOFT_SEVENTEEN = true;

export interface IBlackjackState {
  dealer: Hand;
  currentHand: PlayerHand;
  validDecisions: Decision[];
}

class Blackjack extends React.Component<{}, IBlackjackState> {
  results: Results;
  deck: Deck;
  activeHands: PlayerHand[];
  wager: number;
  decisionHandlers: { decision: Decision; handler: (any?: any) => void }[];

  constructor(props) {
    super(props);

    this.state = {
      dealer: null,
      currentHand: null,
      validDecisions: [Decision.PlaceBet],
    };

    this.results = new Results();
    this.deck = null;
    this.activeHands = [];
    this.wager = 1000;

    this.placeBet = this.placeBet.bind(this);
    this.rebetAndDeal = this.rebetAndDeal.bind(this);
    this.deal = this.deal.bind(this);
    this.hit = this.hit.bind(this);
    this.stand = this.stand.bind(this);
    this.doubleDown = this.doubleDown.bind(this);
    this.split = this.split.bind(this);
    this.showResults = this.showResults.bind(this);
    this.redeal = this.redeal.bind(this);

    this.decisionHandlers = [
      { decision: Decision.PlaceBet, handler: () => this.placeBet(() => {}) },
      { decision: Decision.RebetAndDeal, handler: this.rebetAndDeal },
      { decision: Decision.Deal, handler: this.deal },
      { decision: Decision.DoubleDown, handler: this.doubleDown },
      { decision: Decision.Split, handler: this.split },
      { decision: Decision.Stand, handler: this.stand },
      { decision: Decision.Hit, handler: this.hit },
    ];
  }

  placeBet(callback?: () => void) {
    console.log();
    console.log('placeBet');

    const currentHand = new PlayerHand({ wager: this.wager });
    this.activeHands = [currentHand];
    this.setState(
      {
        currentHand,
      },
      callback
    );
  }

  rebetAndDeal() {
    console.log();
    console.log('rebetAndDeal');
    this.placeBet(this.deal);
  }

  deal() {
    console.log();
    console.log('Dealing');

    // Get new deck
    if (!this.deck || this.deck.RemainingCount < DECK_SIZE) {
      this.deck = new Deck(NUM_DECKS);
    }

    // Burn first card in deck
    if (this.deck.RemainingCount === DECK_SIZE * NUM_DECKS) {
      console.log('Burning card');
      this.deck.draw(false);
    }

    const dealer = new Hand({ isDealer: true });
    let currentHand = this.state.currentHand.clone();
    // console.log(`currentHand: ${currentHand.toString()}`);

    // Deal cards
    currentHand.addCard(this.deck.draw());
    dealer.addCard(this.deck.draw());
    currentHand.addCard(this.deck.draw());
    dealer.addCard(this.deck.draw(false)); // hide dealer second card

    console.log();
    console.log(`Dealer: ${dealer.toString()}`);
    // for (let i = 0; i < activeHands.length; i++) console.log(`Hand ${i + 1}:\t${activeHands[i].ToString()}`);
    console.log(`Hand:\t${currentHand.toString()}`);
    console.log();

    this.activeHands = [currentHand];
    this.setState(
      {
        dealer,
        currentHand,
      },
      () => {
        // Check for potential dealer blackjack
        const cardShowing = this.state.dealer.cards[0];
        console.log('checking for insurance');
        if (cardShowing.IsAce || cardShowing.Value === 10) {
          currentHand = this.state.currentHand.clone();
          // Offer insurance
          if (cardShowing.IsAce) {
            console.log('Insurance? ');
            // if (IsYes())
            {
              currentHand.acceptInsurance();
              console.log('Accepted');
            }

            // else console.log("Declined");
          }

          // else no insurance but dealer may still have blackjack

          // useless cause state updating timeing and timeout not work together
          // build anticipation
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              console.log('.');
            }, 1000);
          }

          console.log('checking if dealer has blackjack');
          if (this.state.dealer.IsBlackjack) {
            console.log('dealer has blackjack');
            const dealer = this.state.dealer.clone();
            dealer.cards[1].flip();
            dealer.stand();
            currentHand.stand();

            this.activeHands = [currentHand];
            this.setState({ dealer, currentHand });
          } else {
            console.log(
              `dealer DOES NOT have blackjack - ${this.state.dealer.cards[0].Rank} ${this.state.dealer.cards[1].Rank}`
            );

            if (currentHand.didInsure) {
              this.activeHands = [currentHand];
              this.setState({
                currentHand,
              });
            }
          }
          console.log();
        } else {
          console.log('no insurance to offer');
        }
      }
    );
  }

  hit() {
    console.log();
    console.log('hit');
    let confirm: boolean = true;
    // confirm bad decisions
    /* if (currentHand.ValueHard >= Hand.SEVENTEEN)
    {
        Console.Write($"Hit hard {currentHand.ValueHard}? ");
        if (!IsYes()) confirm = false;
    }
    else if (currentHand.ValueSoft >= Hand.NINETEEN &&
        currentHand.ValueSoft < Hand.TWENTY_ONE)
    {
        Console.Write($"Hit soft {currentHand.ValueSoft}? ");
        if (!IsYes()) confirm = false;
    } */

    if (confirm) {
      let currentHand = this.state.currentHand.clone();

      currentHand.addCard(this.deck.draw(true));

      // Auto-stand
      if (currentHand.IsTwentyOne) {
        console.log('Auto-stand');
        currentHand.stand();
      }

      console.log(currentHand.toString());
      const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
      console.log('active hands:');
      this.activeHands.forEach((x) => console.log(x.toString()));
      this.activeHands[iCurrentHand] = currentHand;

      this.setState({
        currentHand,
      });
    }
  }

  stand() {
    console.log();
    console.log('stand');
    const currentHand = this.state.currentHand.clone();
    currentHand.stand();

    const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
    this.activeHands[iCurrentHand] = currentHand;

    this.setState({ currentHand });
  }

  doubleDown() {
    console.log();
    console.log('doubleDown');
    const currentHand = this.state.currentHand.clone();
    currentHand.doubleDown(this.deck.draw());

    const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
    this.activeHands[iCurrentHand] = currentHand;

    this.setState({ currentHand });
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
    this.rebetAndDeal();
  };

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<IBlackjackState>, snapshot?: any): void {
    console.log();
    console.log();
    console.log();
    console.log();
    console.log(
      '|================================================ BEGIN componentDidUpdate BEGIN ================================================|'
    );
    console.log();
    try {
      /* console.log(`prevState: ${prevState.currentHand === null ? 'null' : prevState.currentHand.toString()}`);
      console.log(`thisState: ${this.state.currentHand.toString()}`); */
      /*
      console.log(`this.activeHands.length: ${this.activeHands.length}`);
      console.log(
        `prevState.currentHand: ${prevState.currentHand} ${prevState.currentHand.ValueString}, this.state.currentHand: ${this.state.currentHand} ${this.state.currentHand.ValueString}`
      );
      console.log(
        `prevState.currentHand.IsBust: ${prevState.currentHand.IsBust}, this.state.currentHand.IsBust: ${this.state.currentHand.IsBust}`
      );
      console.log(
        `prevState.currentHand.IsTwentyOne: ${prevState.currentHand.IsTwentyOne}, this.state.currentHand.IsTwentyOne: ${this.state.currentHand.IsTwentyOne}`
      );
      console.log(
        `prevState.currentHand.IsBlackjack: ${prevState.currentHand.IsBlackjack}, this.state.currentHand.IsBlackjack: ${this.state.currentHand.IsBlackjack}`
      );
      console.log(
        `prevState.currentHand.didStand: ${prevState.currentHand.didStand}, this.state.currentHand.didStand: ${this.state.currentHand.didStand}`
      );
      console.log(
        `prevState.dealer: ${prevState.dealer} ${prevState.dealer.ValueString}, this.state.dealer: ${this.state.dealer} ${this.state.dealer.ValueString}`
      );
      console.log(
        `prevState.dealer.IsBust: ${prevState.dealer.IsBust}, this.state.dealer.IsBust: ${this.state.dealer.IsBust}`
      );
      console.log(
        `prevState.dealer.IsTwentyOne: ${prevState.dealer.IsTwentyOne}, this.state.dealer.IsTwentyOne: ${this.state.dealer.IsTwentyOne}`
      );
      console.log(
        `prevState.dealer.IsBlackjack: ${prevState.dealer.IsBlackjack}, this.state.dealer.IsBlackjack: ${this.state.dealer.IsBlackjack}`
      );
      console.log(
        `prevState.dealer.didStand: ${prevState.dealer.didStand}, this.state.dealer.didStand: ${this.state.dealer.didStand}`
      ); */
    } catch (error) {}

    /*  (!prevState.currentHand.IsBust && this.state.currentHand.IsBust) ||
        (!prevState.currentHand.IsTwentyOne && this.state.currentHand.IsTwentyOne) ||
        (!prevState.currentHand.IsBlackjack && this.state.currentHand.IsBlackjack) ||
        (!prevState.currentHand.didStand && this.state.currentHand.didStand) */

    if (this.state.currentHand) {
      // DEBUG: display all active hands
      if (this.activeHands.length > 0) {
        this.activeHands.forEach((x, i) =>
          console.log(`\tHand ${i}:\t${x} ${x.IsBlackjack ? 'BLACKJACK' : x.ValueString}`)
        );
      }

      if (this.state.dealer) {
        if (this.state.currentHand.IsBust) console.log(' == BUST == ');
        if (this.state.currentHand.didStand) console.log(' == STAND == ');
        if (this.state.currentHand.IsTwentyOne) console.log(' == 21 == ');
        if (this.state.currentHand.IsBlackjack) console.log(' == BLACKJACK == ');

        // Auto-hit on split hands
        if (this.state.currentHand.didSplit && this.state.currentHand.cards.length === 1) {
          console.log();
          console.log('AUTO-HIT SPLIT HAND');
          const currentHand = this.state.currentHand.clone();
          currentHand.addCard(this.deck.draw());

          // Auto-stand split aces, but only if not dealt another ace
          if (currentHand.cards[0].Rank === ACE && currentHand.cards[1].Rank !== ACE) {
            console.log('AUTO-STAND SPLIT ACES');
            currentHand.stand();
          }

          const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
          this.activeHands[iCurrentHand] = currentHand;

          this.setState({ currentHand });
        }

        // Still some active hands remaining
        // TODO: consider checking if result===inprogress
        if (this.activeHands.some((x) => !x.didStand && !x.IsBust)) {
          console.log('Still some active hands remaining');
          console.log(`currentHand: ${this.state.currentHand.toString()}`);
          // Fresh hand - NOT NECESSARILY DEALT CARDS
          if (!this.state.currentHand.didStand && !this.state.currentHand.DidHit) {
            console.log('detected a fresh hand');
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
          }

          // New current hand exists
          else if (this.state.currentHand.didStand || this.state.currentHand.IsBust) {
            console.log('updating current hand to next active hand');
            const iCurrentHand = this.activeHands.indexOf(this.state.currentHand);
            console.log(`iCurrentHand: ${iCurrentHand}`);

            if (iCurrentHand === -1) console.log('activehands is outdated, you fucked up');
            else {
              console.log('moving to next current hand...');
              const currentHand = this.activeHands[iCurrentHand + 1];
              this.setState({ currentHand });
            }
          }
        }

        // All active hands either stood or busted
        else {
          console.log('All active hands either stood or busted');
          // Flip second dealer card before playing
          if (!this.state.dealer.cards[1].isFaceUp) {
            console.log('flipping dealer second card');
            const dealer = this.state.dealer.clone();
            dealer.cards[1].flip();
            this.setState({ dealer });
          }

          // Dealer plays
          else if (!this.state.dealer.didStand && this.activeHands.some((x) => !x.IsBlackjack && !x.IsBust)) {
            console.log('Dealer plays');
            const dealer = this.state.dealer.clone();
            // both cards flipped, play
            console.log(`dealer value best ${dealer.BestValue}`);
            console.log(`player value best ${this.state.currentHand.BestValue}`);
            console.log(`active hand value best ${this.activeHands[0].BestValue}`);
            let dealerWillHit =
              this.activeHands.some((x) => !x.IsBust) && // exists hands that didnt bust
              (dealer.BestValue < SEVENTEEN || // and dealer under 17 and players exist with 17 or more
                (dealer.HasAce &&
                  dealer.ValueSoft == SEVENTEEN &&
                  HIT_SOFT_SEVENTEEN &&
                  this.activeHands.some((x) => x.BestValue >= SEVENTEEN)));
            this.activeHands.some((x) => !x.IsBust);
            if (dealerWillHit) {
              const card = this.deck.draw();
              console.log(`Dealer dealt card ${card.toString()}`);
              dealer.addCard(card);
            } else {
              console.log('Dealer stands');
              dealer.stand();
            }

            // this.setState({ dealer });
            setTimeout(() => {
              this.setState({ dealer });
            }, 800);
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
              // prettier-ignore
              if (hand.IsWin) {
            if (hand.result == HandResult.WinByBlackjack)
              console.log('BLACKJACK');

            else console.log('WINNER WINNER');
          }

          else if (hand.IsLoss)
            console.log('DEALER WINS');

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

      // Get valid decisions.
      const validDecisions = Object.values(Decision).filter((x) => this.state.currentHand.isDecisionValid(x));
      if (
        validDecisions.length !== this.state.validDecisions.length ||
        this.state.validDecisions.some((x) => !validDecisions.includes(x))
        // this.state.validDecisions.some((x) => !validDecisions.includes(x)).length > 0
      ) {
        console.log();
        console.log(`hand result -> ${this.state.currentHand.result}`);
        /* console.log('previous validDecisions');
        this.state.validDecisions.forEach((x) => console.log(x));
        console.log();
        console.log('validDecisions');
        validDecisions.forEach((x) => console.log(x));
        console.log(); */
        this.setState({
          validDecisions,
        });
      }
    }
    console.log();
    console.log(
      '|================================================ END componentDidUpdate END ================================================|'
    );
    console.log();
  }

  render() {
    return (
      <Layout>
        <div className={`container outline ${styles.table}`}>
          <div id="dealer" className="quarter column outline">
            {this.state.dealer && this.state.dealer.render()}
            {/* {this.state.dealer && this.state.dealer.WasDealtCards && this.state.dealer.cards.map((c) => c.render())} */}
          </div>
          <div className="quarter row outline">
            {this.activeHands
              .filter((x) => x !== this.state.currentHand)
              .map((x, i) => (
                <div key={`activeHand-${i}`} className="column" style={{ margin: '0 1em 0 1em' }}>
                  <p>Hand {this.activeHands.indexOf(x) + 1}</p>
                  <h3>{x.result}</h3>
                  {x.render()}
                </div>
              ))}
          </div>

          <div id="player" className="quarter row outline">
            <div className="third column outline">free space</div>
            <div id="handStatus" className="third column outline">
              {this.state.currentHand && this.state.currentHand.WasDealtCards && (
                <>
                  <p>Hand {this.activeHands.indexOf(this.state.currentHand) + 1}</p>
                  <h3>{this.state.currentHand.result}</h3>
                  {this.state.currentHand.render()}
                </>
              )}
            </div>
            <div className="third column outline">
              <div className="half row">Winnings</div>
              <div className="half row">${this.results.TotalNetWinnings}</div>
            </div>
          </div>

          <div id="controls" className="quarter column outline">
            <div id="choices" className="half row outline">
              {this.state.validDecisions.map((valid, i) => (
                <div key={`choice-${i}`} className="someSpace">
                  <Button
                    onClick={this.decisionHandlers.find(({ decision }) => decision === valid).handler}
                    variant="contained"
                    size="large"
                  >
                    {valid}
                  </Button>
                </div>
              ))}
            </div>
            <div id="bottomPane" className="half row outline">
              <div className="someSpace">
                <Button onClick={this.showResults} variant="contained" size="small">
                  Results
                </Button>
              </div>
              <div className="someSpace">
                <Button onClick={this.redeal} variant="contained" size="small">
                  Redeal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default Blackjack;
