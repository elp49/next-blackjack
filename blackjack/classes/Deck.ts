import { DECK_SIZE } from '../../utils/constants';
import { getRandomInt } from '../../utils/utils';
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

  constructor(props: IDeckProps) {
    console.log(' ==== NEW DECK ====');

    // this.cards = this.allAces(nDecks);
    // this.cards = this.allTens(nDecks);
    // this.cards = this.tensAndAces(nDecks);
    // this.cards = this.createDefaultDeck(nDecks);

    if (props.nDecks > 0) this.cards = this.createDefaultDeck(props.nDecks);
    else this.cards = [];
    this.shuffle();
  }

  public createDefaultDeck(nDecks: number): Card[] {
    console.log(`Creating ${nDecks} decks...`);
    const cards: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < nDecks; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) cards.push(new Card({ index, deckIndex, isFaceUp }));

    return cards;
  }

  private getNDecks(originalNDecks: number, nCardTypeInDeck: number) {
    let nDecks = originalNDecks;
    while (nDecks * nCardTypeInDeck < DECK_SIZE) {
      console.log(`${nDecks * nCardTypeInDeck} < ${DECK_SIZE}`);
      nDecks *= 2;
    }
    return nDecks;
  }

  // for testing split hand ui
  public allTens(nDecks: number): Card[] {
    const NUM_TENS_IN_DECK = 16;
    const n = this.getNDecks(nDecks, NUM_TENS_IN_DECK);
    console.log(`Creating ${n} decks...`);
    const deck: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < n; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) {
        const card = new Card({ index, deckIndex, isFaceUp });
        if (card.Value === 10) deck.push(card);
      }

    return deck;
  }

  // for testing ui
  public allAces(nDecks: number): Card[] {
    const NUM_ACES_IN_DECK = 4;
    const n = this.getNDecks(nDecks, NUM_ACES_IN_DECK);
    console.log(`Creating ${n} decks...`);
    const deck: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < n; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) {
        const card = new Card({ index, deckIndex, isFaceUp });
        if (card.IsAce) deck.push(card);
      }

    return deck;
  }

  // for testing blackjack logic
  public tensAndAces(nDecks: number): Card[] {
    const NUM_TEN_AND_ACES_IN_DECK = 20;
    const n = this.getNDecks(nDecks, NUM_TEN_AND_ACES_IN_DECK);
    console.log(`Creating ${n} decks...`);
    const deck: Card[] = [];
    const isFaceUp = false;
    for (let deckIndex = 0; deckIndex < n; deckIndex++)
      for (let index = 0; index < DECK_SIZE; index++) {
        const card = new Card({ index, deckIndex, isFaceUp });
        if (card.Value === 10 || card.IsAce) deck.push(card);
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
    return c;
  }

  public clone(): Deck {
    console.log(`Cloning deck...`);
    const clone = new Deck({ nDecks: 0 });
    clone.cards = [...this.cards];
    return clone;
  }
}

export default Deck;
