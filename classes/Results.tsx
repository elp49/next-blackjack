import { getCookie, setCookie } from 'cookies-next';
import { atoi, divide, msToTime } from '../utils/utils';
import { HandResult } from './Hand';
import PlayerHand from './PlayerHand';

const COOKIE_NET_WINNINGS = 'netWinnings';

export interface IResultsProps {
  initialState?: IResultsState;
}

export interface IResultsState {
  msStartTime: number;
  currentWinStreak: number;
  longestWinStreak: number;
  hands: PlayerHand[];
  initialNetWinnings: number;
}

class Results {
  msStartTime: number;
  currentWinStreak: number;
  longestWinStreak: number;
  hands: PlayerHand[];
  initialNetWinnings: number;

  public get Hands(): PlayerHand[] {
    return this.hands;
  }

  public get WinningHands(): PlayerHand[] {
    return this.hands.filter((x) => x.IsWin);
  }
  public get LosingHands(): PlayerHand[] {
    return this.hands.filter((x) => x.IsLoss);
  }
  public get WinLossRatio(): number {
    const num = divide(this.WinningHands.length, this.LosingHands.length);
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
  public get TotalHandsWon(): number {
    return this.WinningHands.length;
  }
  public get TotalHandsLost(): number {
    return this.LosingHands.length;
  }
  public get TotalHandsPushed(): number {
    return this.hands.filter((x) => x.result == HandResult.Push).length;
  }
  public get TotalHandsPlayed(): number {
    return this.hands.length;
  }

  public get AverageHandsWon(): number {
    const num = divide(this.TotalHandsWon, this.TotalHandsPlayed);
    return Math.round((num + Number.EPSILON) * 100);
  }
  public get AverageHandsLost(): number {
    const num = divide(this.TotalHandsLost, this.TotalHandsPlayed);
    return Math.round((num + Number.EPSILON) * 100);
  }

  public get TotalWagered(): number {
    return this.hands.map((x) => x.wager).reduce((x, y) => x + y, 0);
  }
  public get TotalNetWinnings(): number {
    return this.initialNetWinnings + this.CurrentNetWinnings;
  }
  public get CurrentNetWinnings(): number {
    return this.hands.map((x) => x.NetPayout).reduce((x, y) => x + y, 0);
  }
  public get TotalWinnings(): number {
    return this.WinningHands.map((x) => x.Payout).reduce((x, y) => x + y, 0);
  }
  public get TotalLosses(): number {
    return this.LosingHands.map((x) => x.wager).reduce((x, y) => x + y, 0);
  }

  public get StartTime(): number {
    return this.msStartTime;
  }
  public get TotalPlayTime(): string {
    return msToTime(Date.now() - this.msStartTime);
  }

  constructor(props: IResultsProps) {
    this.msStartTime = props.initialState ? props.initialState.msStartTime : Date.now();
    this.currentWinStreak = props.initialState ? props.initialState.currentWinStreak : 0;
    this.longestWinStreak = props.initialState ? props.initialState.longestWinStreak : 0;
    this.hands = props.initialState ? props.initialState.hands : [];

    if (props.initialState) {
      this.initialNetWinnings = props.initialState.initialNetWinnings;
    } else {
      const net = getCookie(COOKIE_NET_WINNINGS);
      if (net) this.initialNetWinnings = atoi(net.toString());
      else this.initialNetWinnings = 0;
    }
  }

  public recordHand(hand: PlayerHand): void {
    this.hands.push(hand);

    // Win
    if (hand.IsWin) {
      this.currentWinStreak++;

      // New high streak
      if (this.currentWinStreak > this.longestWinStreak) this.longestWinStreak = this.currentWinStreak;
    }

    // Loss, no push
    else if (hand.IsLoss) this.currentWinStreak = 0;

    // else push does not affect streak

    // Store new winnings
    setCookie(COOKIE_NET_WINNINGS, this.TotalNetWinnings);
  }

  public display(): void {
    console.log(`Total Play Time\t\t${this.TotalPlayTime}`);
    console.log();
    console.log(`Total Won\t\t${this.TotalHandsWon}`);
    console.log(`Total Lost\t\t${this.TotalHandsLost}`);
    console.log(`Total Pushed\t\t${this.TotalHandsPushed}`);
    console.log(`Total Played\t\t${this.TotalHandsPlayed}`);
    console.log();
    console.log(`Average Hands Won\t${this.AverageHandsWon}%`);
    console.log(`Average Hands Lost\t${this.AverageHandsLost}%`);
    console.log();
    console.log(`Total Wagered\t\t${this.TotalWagered}`);
    console.log(`Total Winnings\t\t${this.TotalWinnings}`);
    console.log(`Total Losses\t\t${this.TotalLosses}`);
    console.log(`Total Net Winnings\t${this.TotalNetWinnings}`);
    console.log();
    console.log(`Current Win Streak\t${this.currentWinStreak}`);
    console.log(`Longest Win Streak\t${this.longestWinStreak}`);
  }

  public clone(): Results {
    return new Results({
      initialState: {
        msStartTime: this.msStartTime,
        currentWinStreak: this.currentWinStreak,
        longestWinStreak: this.longestWinStreak,
        hands: [...this.hands],
        initialNetWinnings: this.initialNetWinnings,
      },
    });
  }
}

export default Results;
