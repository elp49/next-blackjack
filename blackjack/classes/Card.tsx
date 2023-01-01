import styles from '../../styles/card.module.css';
import { ACE, FACE_CARDS, NUMBER_CARDS } from '../../utils/constants';

enum Color {
  Red = 'red',
  Black = 'black',
}
const SUITS = '♠︎ ♥︎ ♣︎ ♦︎'.split(' ');
const RANKS = [ACE, ...NUMBER_CARDS, ...FACE_CARDS];

type Position = {
  x: number;
  y: number;
  isMirrored?: boolean;
};

const suitPositions: Position[][] = [
  [{ x: 0, y: 0 }],
  [
    { x: 0, y: -1 },
    { x: 0, y: 1, isMirrored: true },
  ],
  [
    { x: 0, y: -1 },
    { x: 0, y: 0 },
    { x: 0, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: 0 },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -0.5 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -0.5 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0.5, isMirrored: true },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 / 3 },
    { x: 1, y: -1 / 3 },
    { x: 0, y: 0 },
    { x: -1, y: 1 / 3, isMirrored: true },
    { x: 1, y: 1 / 3, isMirrored: true },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -2 / 3 },
    { x: -1, y: -1 / 3 },
    { x: 1, y: -1 / 3 },
    { x: -1, y: 1 / 3, isMirrored: true },
    { x: 1, y: 1 / 3, isMirrored: true },
    { x: 0, y: 2 / 3, isMirrored: true },
    { x: -1, y: 1, isMirrored: true },
    { x: 1, y: 1, isMirrored: true },
  ],
  [{ x: 0, y: 0 }],
  [{ x: 0, y: 0 }],
  [{ x: 0, y: 0 }],
];

export interface ICardProps {
  index: number;
  deckIndex: number;
  isFaceUp: boolean;
}

/* interface ICardState {
  isFaceUp: boolean;
} */

class Card {
  //extends React.Component<ICardProps, ICardState> {
  private index: number;
  private deckIndex: number;
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
    /* this.state = {
      isFaceUp: props.isFaceUp,
    };
 */
    this.index = props.index;
    this.deckIndex = props.deckIndex;
    this.isFaceUp = props.isFaceUp;

    /* this.flip = this.flip.bind(this);
    this.toString = this.toString.bind(this);
    this.getCardSuits = this.getCardSuits.bind(this); */
    // this.render = this.render.bind(this);
  }

  public flip(): void {
    console.log('==========flipping card ===');

    this.isFaceUp = !this.isFaceUp;

    /* this.state = {
      ...this.state,
      isFaceUp: !this.state.isFaceUp,
    }; */

    // this.setState({ isFaceUp: !this.state.isFaceUp });

    console.log('==========flipped ===');
  }

  public toString = (): string => `${this.Rank} of ${this.Suit}`;

  public getCardSuits = (): JSX.Element => (
    <div className={styles.cardSuits}>
      {suitPositions[this.index % 13].map((position, i) => {
        const { x, y, isMirrored } = position;
        const left = `${x * 100 + 10}%`;
        const top = `${y * 100 + 10}%`;
        const mirroredClass = isMirrored ? styles.mirrored : '';

        return (
          <div
            key={`deck-${this.deckIndex}-card-${this.index}-suit-${i}`}
            className={`${styles.cardSuit} ${mirroredClass}`}
            style={{ left: left, top: top }}
          >
            {this.Suit}
          </div>
        );
      })}
    </div>
  );

  // Recursive render
  /* render(cards: Card[], isFirst: boolean): JSX.Element {
    const key = `deck-${this.deckIndex}-card-${this.index}`;
    const grandchildren = [...cards];
    const child = grandchildren && grandchildren.length > 0 ? grandchildren.shift() : null;

    return (
      <div key={key} className={styles.card} style={{ color: this.Color, marginLeft: `${!isFirst && '1.5em'}` }}>
        {this.state.isFaceUp ? (
          <>
            {this.getCardSuits()}
            <div className={styles.cardTopLeft}>
              <div className={styles.cardCornerRank}>{this.Rank}</div>
              <div className={styles.cardCornerSuit}>{this.Suit}</div>
            </div>
            <div className={styles.cardBottomRight}>
              <div className={styles.cardCornerRank}>{this.Rank}</div>
              <div className={styles.cardCornerSuit}>{this.Suit}</div>
            </div>
            {child && child.render(grandchildren, false)}
          </>
        ) : (
          <div className={styles.cardBack}>{child && child.render(grandchildren, false)}</div>
        )}
      </div>
    );
  } */
}

export default Card;
