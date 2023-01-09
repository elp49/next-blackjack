import { ACE, TEN, TWENTY_ONE } from '../../utils/constants';
import { log } from '../../utils/utils';
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
    this.cards.push(card);
  }

  public stand(): void {
    this.didStand = true;
  }

  public toString(): string {
    return this.cards.map((c) => c.Rank).join(', ');
  }

  public clone(): Hand {
    log(`Cloning hand...`);
    const clone = new Hand({
      initialState: {
        cards: [...this.cards],
        result: this.result,
        didStand: this.didStand,
      },
    });
    return clone;
  }
}

export default Hand;
