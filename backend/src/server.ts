import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import routes from "./routes/routes";
import { getNextPlayer, updateGameState } from "./utils";
import { startGame } from "./startGame";
import errorHandler from "./middleware/errorHandler";
import { GameState } from "./utils"; // Importing GameState interface

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.locals.usersInRoom = {};
app.locals.gameHosts = {};
app.locals.socketRoomMap = {};
app.locals.gameState = {} as { [roomId: string]: GameState }; // Using GameState interface

app.get("/", (req: Request, res: Response) => {
  res.send("Exploding chickens game server!");
});

app.use("/api", routes);

app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this to your frontend's origin
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomData) => {
    console.log("roomData", app.locals.usersInRoom[roomData.roomId]);
    if (app.locals.gameState[roomData.roomId]) {
      socket.emit("error", "You cannot join this room , game already started");
      return;
    }

    if (
      app.locals.usersInRoom[roomData.roomId]?.length >= roomData?.maxPlayers
    ) {
      socket.emit(
        "error",
        "Room is full , max players are " + roomData?.maxPlayers
      );
      return;
    }

    if (
      app.locals.usersInRoom[roomData.roomId] &&
      app.locals.usersInRoom[roomData.roomId].find(
        (user: { username: string }) => user.username === roomData.username
      )
    ) {
      socket.emit("error", "Username already exists in this room");
      return;
    }
    socket.join(roomData.roomId);
    app.locals.socketRoomMap[socket.id] = roomData.roomId;
    console.log(`User ${roomData.username} joined room: ${roomData.roomId}`);

    if (!app.locals.usersInRoom[roomData.roomId]) {
      app.locals.usersInRoom[roomData.roomId] = [];
    }
    app.locals.usersInRoom[roomData.roomId].push({
      username: roomData.username,
      socketId: socket.id,
      avatar: roomData.avatar,
    });

    if (roomData.host) {
      app.locals.gameHosts[roomData.roomId] = roomData.username;
    }

    console.log(socket.rooms);

    io.to(roomData.roomId).emit(
      "players",
      app.locals.usersInRoom[roomData.roomId]
    );

    io.to(roomData.roomId).emit(
      "hostUsername",
      app.locals.gameHosts[roomData.roomId]
    );

    socket.emit("playerJoined", roomData.username);
  });

  socket.on("getHostUsername", (roomId) => {
    io.to(roomId).emit("hostUsername", app.locals.gameHosts[roomId]);
  });

  socket.on("getPlayers", (roomId) => {
    io.to(roomId).emit("players", app.locals.usersInRoom[roomId]);
  });

  socket.on("startGame", (gameInput) => {
    startGame(gameInput, app, socket, io);
    io.to(gameInput.roomId).emit("gameStarted");
  });

  socket.on("stopCountdownRequest", (roomId) => {
    io.to(roomId).emit("stopCountdown");
  });

  socket.on("eliminate_player", (gameData) => {
    const roomId = app.locals.socketRoomMap[socket.id];
    const gameState = app.locals.gameState[roomId];
    if (!gameState) {
      socket.emit("error", "Game state not found");
      return;
    }
    const playerIndex = gameState.playersInGame.findIndex(
      (player: string) => player === gameData.username
    );
    if (playerIndex !== -1) {
      gameState.playersInGame.splice(playerIndex, 1);
    }
    gameState.currentPlayerTurn = getNextPlayer(
      gameState.currentPlayerTurn,
      gameState.playersInGame,
      gameState.gameDirection
    );

    const explosionCardIndex = gameState?.deck?.indexOf("explosion");
    if (explosionCardIndex !== -1) {
      gameState?.deck?.splice(explosionCardIndex, 1);
    }

    io.to(roomId).emit("gameStateUpdate", gameState);
  });

  socket.on("updateGameState", (moveData) => {
    const roomId = moveData?.roomId;
    if (!roomId) {
      socket.emit("error", "Room ID not found");
      return;
    }
    const gameState = app.locals.gameState[roomId];
    if (!gameState) {
      socket.emit("error", "Game state not found");
      return;
    }
    updateGameState(
      gameState,
      moveData?.currentPlayerMove,
      moveData?.playerUsernames,
      moveData?.favorFromUsername,
      moveData?.placeExplosionCardInMiddle
    );
    io.to(roomId).emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    const roomId = app.locals.socketRoomMap[socket.id];
    delete app.locals.socketRoomMap[socket.id];
    const usernameIndex = app.locals.usersInRoom[roomId]?.findIndex(
      (user: { socketId: string; username: string }) =>
        user.socketId === socket.id
    );

    if (usernameIndex !== -1) {
      const username =
        app.locals.usersInRoom[roomId]?.[usernameIndex]?.username;
      // Remove the user from gameHosts if they were a host
      if (app.locals.gameHosts[roomId] === username) {
        delete app.locals.gameHosts[roomId];
      }
    }
    if (usernameIndex !== -1) {
      const username =
        app.locals.usersInRoom[roomId]?.[usernameIndex]?.username;
      app.locals.usersInRoom[roomId]?.splice(usernameIndex, 1);

      const gameState = app.locals.gameState[roomId];

      if (!gameState) {
        io.to(roomId).emit("players", app.locals.usersInRoom[roomId]);
        return;
      }
      // Remove playerHands from gameState for the disconnected player
      if (gameState?.playerHands[username]) {
        delete gameState.playerHands[username];
      }
      gameState.playersInGame = gameState?.playersInGame?.filter(
        (player: string) => player !== username
      );
      const explosionCardIndex = gameState?.deck?.indexOf("explosion");
      if (explosionCardIndex !== -1) {
        gameState?.deck?.splice(explosionCardIndex, 1);
      }
      gameState.currentPlayerTurn = getNextPlayer(
        gameState?.currentPlayerTurn,
        app.locals.usersInRoom[roomId]?.map(
          (user: { username: string }) => user.username
        ),
        gameState?.gameDirection
      );

      // Check if it's the last player in the room
      if (app.locals.usersInRoom[roomId]?.length === 0) {
        delete app.locals.gameState[roomId];
        delete app.locals.usersInRoom[roomId];
      } else {
        io.to(roomId).emit("players", app.locals.usersInRoom[roomId]);
        io.to(roomId).emit("gameStateUpdate", gameState);
      }
    }

    console.log("gameState", app.locals.gameState);
    console.log("usersInRoom", app.locals.usersInRoom);
    console.log("gameHosts", app.locals.gameHosts);
    console.log("socketRoomMap", app.locals.socketRoomMap);
  });

  socket.on("gameCompleted", (roomId) => {
    const gameState = app.locals.gameState[roomId];
    if (gameState) {
      gameState.gameCompleted = true;
      io.to(roomId).emit("gameStateUpdate", gameState);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
