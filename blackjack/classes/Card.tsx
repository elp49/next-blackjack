import { ACE, FACE_CARDS, NUMBER_CARDS } from '../../utils/constants';
import { log } from '../../utils/utils';

enum Color {
  Red = 'red',
  Black = 'black',
}
const SUITS = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ');
const RANKS = [ACE, ...NUMBER_CARDS, ...FACE_CARDS];

export interface ICardProps {
  index: number;
  deckIndex: number;
  isFaceUp: boolean;
}

class Card {
  index: number;
  deckIndex: number;
  isFaceUp: boolean;

  public get Key(): string {
    return `deck-${this.deckIndex}-card-${this.index}`;
  }

  public get Rank(): string {
    return RANKS[this.index % 13];
  }
  public get Suit(): string {
    return SUITS[(this.index / 13) | 0];
  }
  public get Color(): Color {
    return ((this.index / 13) | 0) % 2 ? Color.Red : Color.Black;
  }
  public get Value(): number {
    let value = (this.index % 13) + 1;
    if (value > 10) value = 10;
    return value;
  }
  public get CountValue(): number {
    let count;
    // low card
    if (this.Value >= 2 && this.Value <= 6) count = 1;
    // neutral card
    else if (this.Value >= 7 && this.Value <= 9) count = 0;
    // high card
    else count = -1;

    return count;
  }
  public get IsFaceCard(): boolean {
    return FACE_CARDS.includes(this.Rank);
  }
  public get IsAce(): boolean {
    return this.Rank === ACE;
  }

  constructor(props: ICardProps) {
    this.index = props.index;
    this.deckIndex = props.deckIndex;
    this.isFaceUp = props.isFaceUp;
  }

  public flip(): void {
    log('==========flipping card ===');

    this.isFaceUp = !this.isFaceUp;

    log('==========flipped ===');
  }

  public toString = (): string => `${this.Rank} of ${this.Suit}`;
}

export default Card;
