import { DECK_SIZE } from '../utils/constants';
import { getRandomInt } from '../utils/utils';
import Card from './Card';

interface IDeckProps {
  nDecks: number;
}

class Deck {
  private cards: Card[];

  public get RemainingCount(): number {
    console.log(`remaining count: ${this.cards.length}`);
    return this.cards.length;
  }

  constructor(nDecks: number) {
    console.log(' ==== NEW DECK ====');
    this.cards = this.allTens(nDecks);
    // this.cards = this.createDefaultDeck(nDecks);
    this.shuffle();

    this.createDefaultDeck = this.createDefaultDeck.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.draw = this.draw.bind(this);
    // this.Render = this.Render.bind(this);
  }

  public createDefaultDeck(nDecks: number): Card[] {
    console.log(`Creating ${nDecks} decks...`);
    const deck: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < nDecks; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) deck.push(new Card({ index, deckIndex, isFaceUp }));

    /* deck.forEach((c) => {
      console.log(`Deck ${c.deckIndex}: ${c.Rank} of ${c.Suit}`);
    }); */

    return deck;
  }

  // for testing split hand ui
  public allTens(nDecks: number): Card[] {
    console.log(`Creating ${nDecks} decks...`);
    const deck: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < nDecks; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) {
        const card = new Card({ index, deckIndex, isFaceUp });
        if (card.Value === 10) deck.push(card);
      }

    return deck;
  }

  public shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const iRand = getRandomInt(i);
      [this.cards[iRand], this.cards[i]] = [this.cards[i], this.cards[iRand]];
    }
  }

  public draw(flipCard: boolean = true): Card {
    const c = this.cards.shift();
    if (flipCard) c.flip();
    // console.log(`drew card: ${c.toString()}`);
    return c;
  }

  /* public Render = (): JSX.Element => {
    return (
      <div className={styles.deck}>
        {this.cards.map((c) => (
          <div key={`${c.Rank}${c.Suit}`}>{c}</div>
        ))}
      </div>
    );
  }; */
}

export default Deck;
