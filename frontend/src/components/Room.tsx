import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";
import GameLayout from "./GameLayout";
import Header from "./Header";
import UserImage from "../../public/user_image.png";
import { IoCopyOutline } from "react-icons/io5";
import Spinner from "./Spinner";
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

  const [, setCurrentPlayerMove] = useState<string>("");

  const [gameState, setGameState] = useState<any>(null);

  const [loading, setLoading] = useState(false);

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
    if (gameState?.playersInGame?.length === 1 && !gameState?.gameCompleted) {
      socket.emit("gameCompleted", roomId);
    }
  }, [gameState]);

  useEffect(() => {
    socket.on("error", (error) => {
      alert(error);
    });

    socket.on("gameStateUpdate", (gameState) => {
      console.log("Game state updated:", gameState);
      if (gameState.gameCompleted) {
        alert("Game completed , winner is " + gameState.playersInGame[0]);
        return;
      }
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
    setLoading(true);
    setTimeout(() => {
      socket.emit("getPlayers", roomId);
      socket.emit("getHostUsername", roomId);
      setLoading(false);
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

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="h-screen">
      <div className="sticky top-0 z-10">
        <Header currentUser={username} />
      </div>
      {!gameState && currentPlayerJoined && (
        <div className="rounded-lg my-8 mx-4 p-4 border-2 border-orange-500 w-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Players in the Room
          </h3>
          <ul className="list-none space-y-2">
            {players.map((player) => (
              <li key={player.socketId} className="bg-white p-4">
                <img
                  src={UserImage}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                />
                <span className="text-gray-700 text-md">{player.username}</span>
              </li>
            ))}
          </ul>
          {hostUsername === usernameFromState && !gameState && (
            <button
              onClick={startGame}
              className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            >
              Start Game
            </button>
          )}
        </div>
      )}
      {countdownGoing && (
        <h4 className="text-red-600 font-bold">
          ⏰ Lose Countdown: {loseCountdown}
        </h4>
      )}
      {gameState && (
        <GameLayout
          players={players}
          playersInGame={gameState?.playersInGame}
          lastPlayedCard={gameState?.lastPlayedCard}
          playerHands={gameState?.playerHands[username]}
          onCardClick={(move: string) => {
            setCurrentPlayerMove(move);
            makeMove(move as MoveType);
          }}
          currentPlayerTurn={gameState?.currentPlayerTurn}
        />
      )}

      <>
        {!currentPlayerJoined && (
          <div className="mb-4 flex flex-col space-y-4 p-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-fit border-2 border-orange-500 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <button
              onClick={joinRoom}
              className="w-fit mt-2 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            >
              Join Room
            </button>
          </div>
        )}

        {!gameState && (
          <div className="p-4 rounded-lg mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/room/${roomId}`
                );
                alert("Link copied to clipboard!");
              }}
              className="flex items-center gap-2 text-orange-600 underline text-lg mt-2 hover:text-orange-800 transition"
            >
              <IoCopyOutline className="text-2xl" />{" "}
              <span>Copy Invite Link</span>
            </button>
          </div>
        )}
      </>
    </div>
  );
}

export default Room;
