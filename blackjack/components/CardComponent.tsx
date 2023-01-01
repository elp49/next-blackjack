import styles from '../../styles/card.module.css';
import Card from '../classes/Card';

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

type CardComponentProps = {
  card: Card;
};

function CardComponent({ card }: CardComponentProps): JSX.Element {
  const cardSuits = (): JSX.Element => (
    <div className={styles.cardSuits}>
      {suitPositions[card.index % 13].map((position, i) => {
        const { x, y, isMirrored } = position;
        const left = `${x * 100 + 10}%`;
        const top = `${y * 100 + 10}%`;
        const mirroredClass = isMirrored ? styles.mirrored : '';

        return (
          <div
            key={`deck-${card.deckIndex}-card-${card.index}-suit-${i}`}
            className={`${styles.cardSuit} ${mirroredClass}`}
            style={{ left: left, top: top }}
          >
            {card.Suit}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {cardSuits()}
      <div className={styles.cardTopLeft}>
        <div className={styles.cardCornerRank}>{card.Rank}</div>
        <div className={styles.cardCornerSuit}>{card.Suit}</div>
      </div>
      <div className={styles.cardBottomRight}>
        <div className={styles.cardCornerRank}>{card.Rank}</div>
        <div className={styles.cardCornerSuit}>{card.Suit}</div>
      </div>
    </>
  );
}

export default CardComponent;
