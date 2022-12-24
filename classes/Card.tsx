import React from 'react';
import styles from '../styles/card.module.css';
import { ACE, FACE_CARDS, NUMBER_CARDS } from '../utils/constants';

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

// interface ICardState {
//   isFaceUp: boolean;
// }

class Card extends React.Component {
  private index: number;
  private deckIndex: number;
  isFaceUp: boolean;

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
  public get IsFaceCard(): boolean {
    return FACE_CARDS.includes(this.Rank);
  }
  public get IsAce(): boolean {
    return this.Rank === ACE;
  }

  constructor(props: ICardProps) {
    super(props);

    this.index = props.index;
    this.deckIndex = props.deckIndex;
    this.isFaceUp = props.isFaceUp;

    this.flip = this.flip.bind(this);
    this.toString = this.toString.bind(this);
    this.recursiveRender = this.recursiveRender.bind(this);
  }

  flip(): void {
    // console.log('==========flipping card ===');
    this.isFaceUp = !this.isFaceUp;
    // console.log('==========flipped ===');
  }

  toString = (): string => `${this.Rank} of ${this.Suit}`;

  getCardSuits = (): JSX.Element => (
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

  recursiveRender(cards: Card[], isFirst: boolean): JSX.Element {
    const key = `deck-${this.deckIndex}-card-${this.index}`;
    const grandchildren = [...cards];
    const child = grandchildren && grandchildren.length > 0 ? grandchildren.shift() : null;
    try {
      /* console.log(`rending card`);
      console.log(`child: ${child.Rank}`);
      grandchildren.forEach((x) => console.log(`grandchild: ${x.Rank}`)); */
    } catch (error) {}
    return (
      <div key={key} className={styles.card} style={{ color: this.Color, marginLeft: `${!isFirst && '1.5em'}` }}>
        {this.isFaceUp ? (
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
            {child && child.recursiveRender(grandchildren, false)}
          </>
        ) : (
          <div className={styles.cardBack}></div>
        )}
      </div>
    );
  }
}

export default Card;
