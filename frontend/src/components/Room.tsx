import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";
import GameLayout from "./GameLayout";

type MoveType =
  | "defuse"
  | "favor"
  | "explosion"
  | "skip"
  | "reverse"
  | "attack"
  | "future"
  | "shuffle";

function Room() {
  const { roomId } = useParams();
  const { username: usernameFromState } = useLocation().state || "";

  const [username, setUsername] = useState(usernameFromState ?? "");

  console.log("username", username);

  const [players, setPlayers] = useState<
    { username: string; socketId: string }[]
  >([]);

  const [currentPlayerMove, setCurrentPlayerMove] = useState<string>("");

  const [gameState, setGameState] = useState<any>(null);

  const [currentPlayerJoined, setCurrentPlayerJoined] = useState(
    usernameFromState ? true : false
  );

  const [loseCountdown, setLoseCountdown] = useState<number>(
    import.meta.env.VITE_LOSE_COUNTDOWN
  );
  const [countdownGoing, setCountdownGoing] = useState(false);

  console.log("currentPlayerJoined", currentPlayerJoined, usernameFromState);

  const [hostUsername, setHostUsername] = useState<string>("");

  useEffect(() => {
    socket.on("error", (error) => {
      alert(error);
    });

    socket.on("gameStateUpdate", (gameState) => {
      console.log("Game state updated:", gameState);
      if (gameState.explosionCardAtCurrentPlayer) {
        setCountdownGoing(true);
        setLoseCountdown(import.meta.env.VITE_LOSE_COUNTDOWN);
      }
      setGameState(gameState);
    });

    socket.on("playerJoined", () => {
      setCurrentPlayerJoined(true);
    });

    socket.on("stopCountdown", () => {
      setCountdownGoing(false);
    });

    socket.on("hostUsername", (username) => {
      console.log("Host username:", username);
      setHostUsername(username);
    });

    socket.on("players", (players) => {
      console.log("Players:", players);
      setPlayers(players);
    });
  }, []);

  useEffect(() => {
    if (countdownGoing && loseCountdown > 0) {
      const timer = setTimeout(() => {
        setLoseCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdownGoing && loseCountdown === 0) {
      socket.emit("stopCountdownRequest", roomId);
      socket.emit("updateGameState", {
        roomId,
        currentPlayerMove: "explosion",
        playerUsernames: gameState.playersInGame,
      });
    }
  }, [countdownGoing, loseCountdown]);

  useEffect(() => {
    setTimeout(() => {
      socket.emit("getPlayers", roomId);
      socket.emit("getHostUsername", roomId);
    }, 1000);
  }, []);

  const joinRoom = () => {
    socket.emit("joinRoom", { roomId, username });
  };

  const startGame = async () => {
    socket.emit("startGame", {
      roomId,
      playerUsernames: players.map((player) => player.username),
    });
  };

  const makeMove = (move: MoveType) => {
    if (gameState?.currentPlayerTurn === username) {
      if (gameState?.explosionCardAtCurrentPlayer && move !== "defuse") {
        alert(
          "Only defuse card can be played when explosion card is at current player"
        );
        return;
      }
      if (move === "defuse") {
        socket.emit("stopCountdownRequest", roomId);
        socket.emit("updateGameState", {
          roomId,
          currentPlayerMove: move,
          playerUsernames: gameState.playersInGame,
          placeExplosionCardInMiddle: true,
        });
        return;
      } else if (move === "favor") {
        socket.emit("updateGameState", {
          roomId,
          currentPlayerMove: move,
          playerUsernames: gameState.playersInGame,
          favorFromUsername: players.find(
            (player) => player.username !== gameState.currentPlayerTurn
          )?.username,
        });
      } else {
        socket.emit("updateGameState", {
          roomId,
          currentPlayerMove: move,
          playerUsernames: gameState.playersInGame,
        });
      }
    } else {
      alert("Not your turn");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-lg mb-4">
        Username: {username} , state :{" "}
        {!gameState
          ? "not started"
          : gameState?.playersInGame?.includes(username) &&
            gameState?.playersInGame?.length === 1
          ? "won"
          : gameState?.playersInGame?.includes(username)
          ? "in game"
          : "lost"}
      </h3>
      <h3 className="text-lg mb-4">Current Players:</h3>
      <ul className="list-disc pl-5">
        {players.map((player) => (
          <li key={player.socketId}>
            {player.username} -{" "}
            {!gameState
              ? "not started"
              : gameState?.playersInGame?.includes(player.username) &&
                gameState?.playersInGame?.length === 1
              ? "won"
              : gameState?.playersInGame?.includes(player.username)
              ? "in game"
              : "lost"}
          </li>
        ))}
      </ul>
      <h1 className="text-2xl font-bold mb-2">Room: {roomId}</h1>
      {gameState && (
        <GameLayout
          lastPlayedCard={gameState?.lastPlayedCard}
          playerHands={gameState?.playerHands[username]}
          onCardClick={(move: string) => {
            setCurrentPlayerMove(move);
            makeMove(move as MoveType);
          }}
          currentPlayerTurn={gameState?.currentPlayerTurn}
        />
      )}
      {countdownGoing && (
        <h4 className="text-red-500">Lose countdown: {loseCountdown}</h4>
      )}
      <>
        {!currentPlayerJoined && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-blue-500 p-2 rounded-lg w-full"
            />
            <button
              onClick={joinRoom}
              className="mt-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
            >
              Join Room
            </button>
          </div>
        )}

        {hostUsername === usernameFromState && (
          <button
            onClick={startGame}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
          >
            Start Game
          </button>
        )}
        <p className="text-center">Share this link to join the game</p>
        <a
          href={`${window.location.origin}/room/${roomId}`}
          className="text-blue-500 underline"
        >
          {window.location.origin}/room/{roomId}
        </a>
      </>
    </div>
  );
}

export default Room;
