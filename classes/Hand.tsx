import React from 'react';
import { ACE, TEN, TWENTY, TWENTY_ONE } from '../utils/constants';
import Card from './Card';

export enum HandResult {
  InProgress = 'In Progress',
  WinByTotal = 'Win',
  WinByBlackjack = 'Blackjack',
  Loss = 'Loss',
  Push = 'Push',
}

export interface IHand {
  didStand: boolean;
  DidHit: boolean;
  BestValue: number;
  IsBlackjack: boolean;
  IsTwentyOne: boolean;
  IsBust: boolean;
}

export interface IHandProps {
  isDealer: boolean;
}

export interface IHandState {}

class Hand extends React.Component<IHandProps, IHandState> implements IHand {
  cards: Card[];
  result: HandResult;
  didStand: boolean;
  isDealer: boolean;

  public get DidHit() {
    return this.cards.length > 2;
  }

  public get WasDealtCards(): boolean {
    return this.cards != null && this.cards.length > 0;
  }

  public get HasAce(): boolean {
    return this.cards.some((x) => x.Rank === ACE);
  }
  public get ValueSoft(): number {
    return this.HasAce ? this.ValueHard + TEN : this.ValueHard;
  }
  public get ValueHard(): number {
    return this.cards.map((c) => c.Value).reduce((x, y) => x + y, 0);
  }
  public get BestValue(): number {
    return this.ValueSoft > this.ValueHard && this.ValueSoft <= TWENTY_ONE ? this.ValueSoft : this.ValueHard;
  }

  public get IsBlackjack(): boolean {
    return !this.DidHit && this.IsTwentyOne;
  }
  public get IsTwentyOne(): boolean {
    return this.ValueHard == TWENTY_ONE || this.ValueSoft == TWENTY_ONE;
  }
  public get IsBust(): boolean {
    return this.ValueHard > TWENTY_ONE;
  }

  public get ValueString(): string {
    return this.ValueHard === this.BestValue ? this.ValueHard.toString() : `(${this.ValueHard}/${this.ValueSoft})`;
  }

  constructor(props) {
    super(props);

    this.cards = [];
    this.result = HandResult.InProgress;
    this.didStand = false;
    this.isDealer = props.isDealer;

    this.addCard = this.addCard.bind(this);
    this.stand = this.stand.bind(this);

    this.toString = this.toString.bind(this);
    this.clone = this.clone.bind(this);
    this.render = this.render.bind(this);
  }

  addCard(card: Card): void {
    this.cards.push(card);
  }

  stand(): void {
    this.didStand = true;
  }

  toString(): string {
    return this.cards.map((c) => c.Rank).join(', ');
  }

  clone(): Hand {
    const clone = new Hand({ isDealer: this.isDealer });
    clone.cards = [...this.cards];
    clone.result = this.result;
    clone.didStand = this.didStand;
    return clone;
  }

  render(): JSX.Element {
    const children = [...this.cards];
    const parent = children && children.length > 0 ? children.shift() : null;

    try {
      /* console.log(`rending ${this.isDealer ? ' // DEALER \\\\ ' : 'player'} hand`);
      console.log(`this.cards.length: ${this.cards.length}`);
      console.log(`children.length: ${children.length}`);
      console.log(`parent: ${parent.Rank}`);
      children.forEach((x) => console.log(`child: ${x.Rank}`)); */
    } catch (error) {}

    return (
      <div className="column" style={{ position: 'relative' }}>
        {this.WasDealtCards && (!this.isDealer || (this.cards.length >= 2 && this.cards[1].isFaceUp)) && (
          <p
          // style={{ margin: '1em' }}
          >
            {/* this logic should probably be in the BestValue property */}
            {this.didStand ? this.BestValue : this.ValueSoft <= TWENTY ? this.ValueString : this.ValueHard}
          </p>
        )}
        {/* <div
          style={{
            position: 'relative',
            width: `calc(${children.length} * 1.3em + 5em)`,
            height: `7em`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          > */}
        <div
          style={{
            position: 'relative',
            width: `calc(${children.length} * 1.3em + 5em)`,
          }}
        >
          {parent && parent.recursiveRender(children, true)}
          {this.result !== HandResult.InProgress && (
            <div
              style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'max-content',
                backgroundColor: 'black',
                opacity: 0.8,
                padding: '0.2em',
                border: '1px solid gold',
                borderRadius: '0.5em',
                color: 'white',
              }}
            >
              <h3>{this.result.toUpperCase()}</h3>
            </div>
          )}
        </div>
        {/* </div> */}
      </div>
    );
  }
}

export default Hand;
