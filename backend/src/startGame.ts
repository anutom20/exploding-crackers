import { Server, Socket } from "socket.io";
import { createDeck, distributeCards } from "./utils";
import { Express } from "express";

export const startGame = (
  gameInput: {
    roomId: string;
    playerUsernames: string[];
  },
  app: Express,
  socket: Socket,
  io: Server
) => {
  const room = app.locals.usersInRoom[gameInput.roomId];

  if (!room || room.length < 2) {
    socket.emit("error", "Invalid room or not enough players");
    return;
  }

  const numPlayers = room.length;
  const deck = createDeck(numPlayers);
  const [finalDeck, playerHands] = distributeCards(
    deck,
    numPlayers,
    gameInput.playerUsernames
  );

  app.locals.gameState[gameInput.roomId] = {
    deck: finalDeck,
    playerHands,
    playersInGame: gameInput.playerUsernames,
    currentPlayerRepeatedTurns: 0,
    showFutureCurrentPlayer: false,
    explosionCardAtCurrentPlayer: false,
    lastPlayedCard: "None",
    gameDirection: "clockwise",
    currentPlayerTurn: app.locals.gameHosts[gameInput.roomId],
  };

  io.to(gameInput.roomId).emit("gameStateUpdate", {
    deck: finalDeck,
    playerHands,
    playersInGame: gameInput.playerUsernames,
    currentPlayerRepeatedTurns: 0,
    showFutureCurrentPlayer: false,
    explosionCardAtCurrentPlayer: false,
    gameDirection: "clockwise",
    lastPlayedCard: "None",
    currentPlayerTurn: app.locals.gameHosts[gameInput.roomId],
  });
};
