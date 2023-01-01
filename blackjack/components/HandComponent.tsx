import Card from '../../blackjack/classes/Card';
import styles from '../../styles/card.module.css';
import Hand, { HandResult } from '../classes/Hand';

type HandComponentProps = {
  hand: Hand;
  isDealer: boolean;
};

function HandComponent({ hand, isDealer }: HandComponentProps): JSX.Element {
  const faceUpCards = hand.clone();
  faceUpCards.cards = faceUpCards.cards.filter((x) => x.isFaceUp);

  function recursiveRender(cards: Card[], isFirst: boolean): JSX.Element {
    const children = [...cards];
    const parent = children.shift();

    // const grandchildren = [...children];
    // const child = grandchildren && grandchildren.length > 0 ? grandchildren.shift() : null;

    return (
      <div
        key={parent.Key}
        className={styles.card}
        style={{ color: parent.Color, marginLeft: `${!isFirst && '1.5em'}` }}
      >
        {parent.isFaceUp ? (
          <>
            {parent.getCardSuits()}
            <div className={styles.cardTopLeft}>
              <div className={styles.cardCornerRank}>{parent.Rank}</div>
              <div className={styles.cardCornerSuit}>{parent.Suit}</div>
            </div>
            <div className={styles.cardBottomRight}>
              <div className={styles.cardCornerRank}>{parent.Rank}</div>
              <div className={styles.cardCornerSuit}>{parent.Suit}</div>
            </div>
            {children.length > 0 && recursiveRender(children, false)}
          </>
        ) : (
          <div className={styles.cardBack}>{children.length > 0 && recursiveRender(children, false)}</div>
        )}
      </div>
    );
  }

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
        {faceUpCards.cards.length > 0 && (!isDealer || faceUpCards.cards.length >= 2)
          ? hand.didStand
            ? faceUpCards.BestValue
            : faceUpCards.ValueString
          : ''}
      </p>
      <div
        style={{
          position: 'relative',
          width: `calc(${hand.cards.length - 1} * 1.5em + 5em)`,
        }}
      >
        {hand.cards.length > 0 && recursiveRender(hand.cards, true)}
        {!isDealer && hand.result !== HandResult.InProgress && (
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
              boxShadow: '0 0.0625em 0.125em rgb(0, 0, 0)',
            }}
          >
            <span>{hand.result.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HandComponent;
