import Card from './Card';
import Hand, { IHand, HandResult, IHandState } from './Hand';

export enum Decision {
  PlaceBet = 'PLACE BET',
  Deal = 'DEAL',
  RebetAndDeal = 'REBET & DEAL',
  Hit = 'HIT',
  Stand = 'STAND',
  DoubleDown = 'DOUBLE DOWN',
  Split = 'SPLIT',
  // DisplayResults = 'RESULTS',
  // NoPlay = 'NO PLAY',
  // Quit = 'QUIT',
}

/* interface IPlayerHandProps {
  wager: number;
}

interface IPlayerHandState {
  wager: number;
  insurancePayout: number;
  didDoubleDowned: boolean;
  didSplit: boolean;
  didInsure: boolean;
}

class PlayerHand extends Hand<IPlayerHandState> { */
interface IPlayerHandProps {
  wager: number;
}

class PlayerHand extends Hand {
  wager: number;
  insurancePayout: number;
  didDoubleDowned: boolean;
  didSplit: boolean;
  didInsure: boolean;

  public get IsWin(): boolean {
    return this.result == HandResult.WinByTotal || this.result == HandResult.WinByBlackjack;
  }

  public get IsLoss(): boolean {
    return this.result == HandResult.Loss;
  }

  public get IsBlackjack(): boolean {
    return !this.DidHit && this.IsTwentyOne && !this.didSplit;
  }

  public get NetPayout(): number {
    let net = this.Payout - this.wager;
    if (this.didInsure) net += this.insurancePayout - this.wager / 2;
    return net;
  }

  public get Payout() {
    let multiplier: number;

    switch (this.result) {
      case HandResult.WinByTotal:
        multiplier = 2; // 1:1
        break;

      case HandResult.WinByBlackjack: // 3:2
        multiplier = 2.5;
        break;

      case HandResult.Push:
        multiplier = 1;
        break;

      default:
        multiplier = 0;
        break;
    }

    return this.wager * multiplier + this.insurancePayout;
  }

  /// <summary>
  /// Can hit if no stand, no bust, no blackjack or 21, and no doubled down.
  /// </summary>
  public get CanHit(): boolean {
    return (
      this.WasDealtCards &&
      !this.didStand &&
      !this.didDoubleDowned &&
      !this.IsBust &&
      !this.IsBlackjack &&
      !this.IsTwentyOne
    );
  }

  /// <summary>
  /// Can double down if no hit, no stand, no bust, and no blackjack.
  /// </summary>
  public get CanDoubleDown(): boolean {
    return this.WasDealtCards && !this.DidHit && !this.didStand && !this.IsBust && !this.IsBlackjack;
  }

  /// <summary>
  /// Can split if no hit, no stand, no bust, no blackjack, and cards have same value.
  /// </summary>
  public get CanSplit(): boolean {
    return (
      this.WasDealtCards &&
      !this.DidHit &&
      !this.didStand &&
      !this.IsBust &&
      !this.IsBlackjack &&
      this.cards.length == 2 &&
      this.cards[0].Value == this.cards[1].Value
    );
  }

  constructor(props: IPlayerHandProps) {
    super({ isDealer: false });

    this.wager = props.wager;
    this.insurancePayout = 0;
    this.didDoubleDowned = false;
    this.didSplit = false;
    this.didInsure = false;

    this.acceptInsurance = this.acceptInsurance.bind(this);
    this.doubleDown = this.doubleDown.bind(this);
    this.split = this.split.bind(this);
    this.isDecisionValid = this.isDecisionValid.bind(this);
    this.calculateResult = this.calculateResult.bind(this);

    // this.render = this.render.bind(this);
  }

  public acceptInsurance = (): void => {
    this.didInsure = true;
  };

  public doubleDown = (card: Card): void => {
    this.didDoubleDowned = true;
    this.wager = this.wager * 2;

    this.addCard(card);
    this.stand();
  };

  public split = (): PlayerHand => {
    if (!this.CanSplit)
      throw new Error(
        'Tried to split, but cannot. you fucked up. hope this helps :/\n' +
          `Cards: ${this.cards}\n` +
          `WasDealtCards=${this.WasDealtCards}\n` +
          `!DidHit=${!this.DidHit}\n` +
          `&& !DidStand=${!this.didStand}\n` +
          `!IsBust=${!this.IsBust}\n` +
          `!IsBlackjack=${!this.IsBlackjack}\n` +
          `${this.cards[0].Rank}==${this.cards[1].Rank}: ${this.cards[0].Rank == this.cards[1].Rank}`
      );

    const split = new PlayerHand({ wager: this.wager });
    split.addCard(this.cards.pop());

    this.didSplit = true;
    split.didSplit = true;
    return split;
  };

  public isDecisionValid = (decision: Decision): boolean => {
    let isValid: boolean;

    switch (decision) {
      // Can place bet if game is not already in play.
      case Decision.PlaceBet:
        // case Decision.DisplayResults:
        // case Decision.NoPlay:
        isValid = !this.WasDealtCards;
        break;

      // Can deal if game is not already in play and a wager was placed.
      case Decision.Deal:
        isValid = !this.WasDealtCards && this.wager > 0;
        break;

      case Decision.RebetAndDeal:
        isValid = this.result != HandResult.InProgress;
        break;

      case Decision.Hit:
        isValid = this.CanHit;
        break;

      case Decision.Stand:
        isValid = !this.didStand && this.WasDealtCards && this.result == HandResult.InProgress;
        break;

      case Decision.DoubleDown:
        isValid = this.CanDoubleDown;
        break;

      case Decision.Split:
        isValid = this.CanSplit;
        break;

      // case Decision.Quit:
      //   isValid = true;
      //   break;

      default:
        throw new Error(`Unknown decision type: ${decision}`);
    }

    return isValid;
  };

  // state shit made this a headache so use custom format
  // prettier-ignore
  public calculateResult = (dealer: IHand): HandResult => {
    if (this.IsBlackjack) {
      if (dealer.IsBlackjack) {
        // then that sucks
        this.result = HandResult.Push;

        if (this.didInsure) {
          this.insurancePayout = this.wager;
        }
      }

      // winner winner chicken dinner
      else {
        this.result = HandResult.WinByBlackjack;
      }
    }

    // sucker!
    else if (dealer.IsBlackjack) {
      this.result = HandResult.Loss;

      if (this.didInsure) {
        this.insurancePayout = this.wager;
      }
    }

    else if (this.IsBust) {
      this.result = HandResult.Loss;
    }

    else if (dealer.IsBust) {
      this.result = HandResult.WinByTotal;
    }

    else if (this.didStand && dealer.didStand) {
      if (this.BestValue > dealer.BestValue) {
        this.result = HandResult.WinByTotal;
      }

      else if (this.BestValue == dealer.BestValue) {
        this.result = HandResult.Push;
      }

      else {
        this.result = HandResult.Loss;
      }
    }

    // else hand is still in progress

    return this.result;
  };

  clone(): PlayerHand {
    const clone = new PlayerHand({ wager: this.wager });
    clone.cards = [...this.cards];
    clone.result = this.result;
    clone.didStand = this.didStand;
    clone.insurancePayout = this.insurancePayout;
    clone.didDoubleDowned = this.didDoubleDowned;
    clone.didSplit = this.didSplit;
    clone.didInsure = this.didInsure;
    return clone;
  }

  /* render() {
    console.log('rendering player hand');
    return <div className="row">{this.cards.map((c) => c.render())}</div>;
  } */
}

export default PlayerHand;

/*
  public calculateResult = (dealer: IHand): HandResult => {
    if (this.IsBlackjack) {
      if (dealer.IsBlackjack) {
        // then that sucks
        this.setState({
          result: HandResult.Push,
        });

        if (this.state.didInsure) {
          this.setState({
            insurancePayout: this.state.wager,
          });
        }
      }

      // winner winner chicken dinner
      else {
        this.setState({
          result: HandResult.WinByBlackjack,
        });
      }
    }

    // sucker!
    else if (dealer.IsBlackjack) {
      this.setState({
        result: HandResult.Loss,
      });

      if (this.state.didInsure) {
        this.setState({
          insurancePayout: this.state.wager,
        });
      }
    }

    else if (this.IsBust) {
      this.setState({
        result: HandResult.Loss,
      });
    }

    else if (dealer.IsBust) {
      this.setState({
        result: HandResult.WinByTotal,
      });
    }

    else if (this.didStand && dealer.DidStand) {
      if (this.BestValue > dealer.BestValue) {
        this.setState({
          result: HandResult.WinByTotal,
        });
      }

      else if (this.BestValue == dealer.BestValue) {
        this.setState({
          result: HandResult.Push,
        });
      }

      else {
        this.setState({
          result: HandResult.Loss,
        });
      }
    }

    // else hand is still in progress

    return this.state.result;
  }; */
