import { ACE, TEN, TWENTY_ONE } from '../utils/constants';
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
  initialState?: IHandState;
}

export interface IHandState {
  cards: Card[];
  result: HandResult;
  didStand: boolean;
}

class Hand implements IHand {
  cards: Card[];
  result: HandResult;
  didStand: boolean;

  public get DidHit() {
    return this.cards.length > 2;
  }

  public get WasDealtCards(): boolean {
    return this.cards != null && this.cards.length > 1;
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
    return this.ValueSoft <= TWENTY_ONE ? this.ValueSoft : this.ValueHard;
  }

  public get IsBlackjack(): boolean {
    return !this.DidHit && this.IsTwentyOne;
  }
  public get IsTwentyOne(): boolean {
    return this.BestValue === TWENTY_ONE;
  }
  public get IsBust(): boolean {
    return this.ValueHard > TWENTY_ONE;
  }

  public get ValueString(): string {
    return this.ValueHard === this.BestValue
      ? this.ValueHard.toString()
      : this.IsBlackjack
      ? TWENTY_ONE.toString()
      : `(${this.ValueHard}/${this.ValueSoft})`;
  }

  constructor(props: IHandProps) {
    this.cards = props.initialState ? props.initialState.cards : [];
    this.result = props.initialState ? props.initialState.result : HandResult.InProgress;
    this.didStand = props.initialState ? props.initialState.didStand : false;
  }

  public addCard(card: Card): void {
    // this.setState({ cards: [...this.state.cards, card] });
    this.cards.push(card);
    // this.state = { ...this.state, cards: [...this.cards, card] };
  }

  public stand(): void {
    // this.setState({ didStand: true });
    this.didStand = true;
    // this.state = { ...this.state, didStand: true };
  }

  public toString(): string {
    return this.cards.map((c) => c.Rank).join(', ');
  }

  public clone(): Hand {
    console.log(`Cloning hand...`);
    const clone = new Hand({
      initialState: {
        cards: [...this.cards],
        result: this.result,
        didStand: this.didStand,
      },
    });
    // clone.setState(this.state);
    /* clone.cards = [...this.cards];
    clone.result = this.result;
    clone.didStand = this.didStand; */
    return clone;
  }

  /* render() {
    return (
      <div className="column">
        <p
          style={{
            height: '1.5em',
            fontSize: '1.5em',
            color: 'white',
            // textShadow: '-1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 2px #000, -1px -1px 2px #000',
            textShadow: '-1px 1px 2px #000',
          }}
        >
          {this.state.cards.length > 0 &&
          (!this.props.isDealer || (this.state.cards.length >= 2 && this.state.cards[0].isFaceUp))
            ? this.state.didStand
              ? this.BestValue
              : this.ValueString
            : ''}
        </p>
        <div
          style={{
            position: 'relative',
            width: `calc(${this.state.cards.length - 1} * 1.5em + 5em)`,
          }}
        >
          {this.state.cards.length > 0 && this.recursiveRender(this.state.cards, true)}
          {!this.props.isDealer && this.state.result !== HandResult.InProgress && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '-6px',
                minWidth: 'calc(5em + 6px)',
                // minWidth: '50%',
                backgroundColor: 'black',
                opacity: 0.9,
                padding: '0.2em',
                border: '1px solid gold',
                borderRadius: '0.5em',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <span>{this.state.result.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>
    );
  } */
}

export default Hand;
