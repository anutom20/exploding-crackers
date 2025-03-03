export interface GameState {
  showFutureCurrentPlayer: boolean;
  lastPlayedCard: string;
  currentPlayerTurn: string;
  currentPlayerRepeatedTurns: boolean;
  gameDirection: "clockwise" | "counterclockwise";
  explosionCardAtCurrentPlayer: boolean;
  currentPlayerTurnAgain: boolean;
  deck: string[];
  gameCompleted?: boolean;
  playerHands: { [username: string]: string[] };
  playersInGame: string[];
}

const normalCardTypes = [
  "skip",
  "reverse",
  "attack",
  "future",
  "favor",
  "shuffle",
];

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function createDeck(numPlayers: number) {
  const deck: any[] = [];
  const totalCards = numPlayers * 4;
  for (let i = 0; i < totalCards; i++) {
    deck.push(
      normalCardTypes[Math.floor(Math.random() * normalCardTypes.length)]
    );
  }
  shuffle(deck);
  return deck;
}

export function distributeCards(
  deck: any[],
  numPlayers: number,
  playerUsernames: string[]
) {
  const playerHands: any = {};
  const numDefuseCards = numPlayers + Math.floor(Math.random() * numPlayers);
  const numExplodingBombCards = numPlayers - 1;
  for (let i = 0; i < numPlayers; i++) {
    if (!playerHands[playerUsernames[i]]) {
      playerHands[playerUsernames[i]] = [];
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < numPlayers; j++) {
      playerHands[playerUsernames[j]].push(deck.pop()); // Get the last element
    }
  }
  // Add 1 Defuse card to each player's hand
  for (let j = 0; j < numPlayers; j++) {
    playerHands[playerUsernames[j]].push("defuse");
  }
  for (let i = 0; i < numExplodingBombCards; i++) {
    deck.push("explosion");
  }
  for (let i = 0; i < numDefuseCards - numPlayers; i++) {
    deck.push("defuse");
  }
  const cardsToAddInDeck = numPlayers * 2 - 2;
  for (let i = 0; i < cardsToAddInDeck; i++) {
    deck.push(
      normalCardTypes[Math.floor(Math.random() * normalCardTypes.length)]
    );
  }
  shuffle(deck);
  return [deck, playerHands];
}

export const updateGameState = (
  gameState: GameState,
  currentPlayerMove: string,
  playerUsernames: string[],
  favorFromUsername?: string,
  placeExplosionCardInMiddle?: boolean
) => {
  console.log("favorFromUsername", favorFromUsername);
  if (!gameState) {
    throw new Error("Game state not found for the given roomId");
  }
  gameState.showFutureCurrentPlayer = false;
  switch (currentPlayerMove) {
    case "skip":
      gameState.lastPlayedCard = "skip";
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "skip");
      break;
    case "reverse":
      gameState.lastPlayedCard = "reverse";
      gameState.gameDirection =
        gameState.gameDirection === "clockwise"
          ? "counterclockwise"
          : "clockwise";
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "reverse");
      break;
    case "attack":
      gameState.lastPlayedCard = "attack";
      gameState.currentPlayerRepeatedTurns = true;
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "attack");
      gameState.currentPlayerTurn = getNextPlayer(
        gameState.currentPlayerTurn,
        playerUsernames,
        gameState.gameDirection
      );
      gameState.currentPlayerTurnAgain = false;
      return gameState;
    case "shuffle":
      gameState.lastPlayedCard = "shuffle";
      gameState.deck = shuffle(gameState.deck);
      gameState.currentPlayerRepeatedTurns = true;
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "shuffle");
      break;
    case "future":
      gameState.lastPlayedCard = "future";
      gameState.showFutureCurrentPlayer = true;
      gameState.currentPlayerRepeatedTurns = true;
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "future");
      break;
    case "favor":
      if (favorFromUsername) {
        transferCard(gameState, favorFromUsername, playerUsernames);
        gameState.lastPlayedCard = "favor";
        gameState.currentPlayerRepeatedTurns = true;
        removeCardFromHand(gameState, gameState.currentPlayerTurn, "favor");
      }
      break;
    case "draw":
      const cardToDraw = gameState.deck.pop();
      if (cardToDraw === "explosion") {
        gameState.explosionCardAtCurrentPlayer = true;
        gameState.lastPlayedCard = "explosion";
        gameState.deck.push("explosion");
        return gameState;
      }
      if (cardToDraw) {
        gameState.playerHands[gameState.currentPlayerTurn].unshift(cardToDraw);
        gameState.lastPlayedCard = "Card drawn from deck";
      }
      break;
    case "defuse":
      gameState.lastPlayedCard = "defuse";
      if (gameState.explosionCardAtCurrentPlayer) {
        gameState.explosionCardAtCurrentPlayer = false;
        if (placeExplosionCardInMiddle) {
          const randomIndex = Math.floor(Math.random() * gameState.deck.length);
          gameState.deck.splice(randomIndex, 0, "explosion");
          gameState.deck.pop();
        }
      }
      removeCardFromHand(gameState, gameState.currentPlayerTurn, "defuse");
      break;
    case "explosion":
      gameState.lastPlayedCard = "explosion";
      if (gameState.explosionCardAtCurrentPlayer) {
        gameState.explosionCardAtCurrentPlayer = false;
        gameState.playersInGame = gameState.playersInGame.filter(
          (player: string) => player !== gameState.currentPlayerTurn
        );
      }
      gameState.deck.pop();
      break;
    default:
      throw new Error("Invalid move");
  }
  if (gameState.currentPlayerRepeatedTurns) {
    gameState.currentPlayerRepeatedTurns = false;
    gameState.currentPlayerTurnAgain = true;
    return gameState;
  } else {
    gameState.currentPlayerTurnAgain = false;
  }
  gameState.currentPlayerTurn = getNextPlayer(
    gameState.currentPlayerTurn,
    playerUsernames,
    gameState.gameDirection
  );
  return gameState;
};

const removeCardFromHand = (
  gameState: GameState,
  player: string,
  cardType: string
) => {
  const hand = gameState.playerHands[player];
  const cardIndex = hand.indexOf(cardType);
  if (cardIndex !== -1) {
    hand.splice(cardIndex, 1); // Remove one card of the specified type
  }
};

export const getNextPlayer = (
  currentTurn: string,
  playerUsernames: string[],
  gameDirection: "clockwise" | "counterclockwise"
) => {
  const currentIndex = playerUsernames?.indexOf(currentTurn);
  return gameDirection === "clockwise"
    ? playerUsernames[(currentIndex + 1) % playerUsernames.length]
    : playerUsernames[
        (currentIndex - 1 + playerUsernames.length) % playerUsernames.length
      ];
};

const getPreviousPlayer = (
  currentTurn: string,
  playerUsernames: string[],
  gameDirection: "clockwise" | "counterclockwise"
) => {
  const currentIndex = playerUsernames.indexOf(currentTurn);
  return gameDirection === "clockwise"
    ? playerUsernames[
        (currentIndex - 1 + playerUsernames.length) % playerUsernames.length
      ]
    : playerUsernames[(currentIndex + 1) % playerUsernames.length];
};

const transferCard = (
  gameState: GameState,
  fromUsername: string,
  playerUsernames: string[]
) => {
  const fromPlayerIndex = playerUsernames.indexOf(fromUsername);
  const currentPlayerIndex = playerUsernames.indexOf(
    gameState.currentPlayerTurn
  );
  if (fromPlayerIndex === -1 || currentPlayerIndex === -1) {
    throw new Error("Invalid player username");
  }
  if (gameState.playerHands[fromUsername].length === 0) {
    throw new Error("The selected player has no cards to transfer");
  }
  const cardToTransferIndex = Math.floor(
    Math.random() * gameState.playerHands[fromUsername].length
  );
  const cardToTransfer =
    gameState.playerHands[fromUsername][cardToTransferIndex];
  gameState.playerHands[gameState.currentPlayerTurn].push(cardToTransfer);
  gameState.playerHands[fromUsername].splice(cardToTransferIndex, 1);
};
