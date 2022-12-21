import Deck from 'react-poker';
import { useEffect, useState } from 'react';
import 'react-poker/dist/styles.css';

const range = (start: number, count: number) =>
  Array.apply(0, Array(count)).map((element, index) => {
    return index + start;
  });

function shuffle(array: string[]) {
  const copy = [];
  let n = array.length;
  let i;
  // While there remain elements to shuffle…
  while (n) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * array.length);

    // If not already shuffled, move it to the new array.
    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
}

const suits = ['d', 'c', 'h', 's'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getDeck = () => shuffle(ranks.map((r) => suits.map((s) => r + s)).reduce((prev, curr) => prev.concat(curr)));

function Blackjack(): JSX.Element {
  const [deck, setDeck] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>([]);

  useEffect(() => {
    setDeck(getDeck());
  }, []);

  const newRound = () => {
    setDeck(getDeck());
    setBoard([]);
  };

  const dealFlop = () => {
    let flop = [];

    for (let i = 0; i < 3; i++) {
      const card = deck.pop();
      if (card != undefined) flop.push(card);
    }

    setDeck(deck);
    setBoard(flop);
  };

  const dealCard = () => {
    const card = deck.pop();
    if (card != undefined) {
      const newBoard = board.concat(card);
      setDeck(deck);
      setBoard(newBoard);
    }
  };

  const progressDeal = () => {
    if (board.length === 0) {
      dealFlop();
      return;
    }

    if (board.length === 5) {
      newRound();
    } else {
      dealCard();
    }
  };

  return (
    <div style={{ left: '10vw', top: '10vh', position: 'absolute' }}>
      <button style={{ padding: '1.5em', margin: '2em' }} onClick={progressDeal}>
        Deal
      </button>
      <Deck
        board={['3s', 'Qh', 'As']}
        boardXoffset={375} // X axis pixel offset for dealing board
        boardYoffset={200} // Y axis pixel offset for dealing board
        size={200} // card height in pixels
      />
    </div>
  );
}

export default Blackjack;
