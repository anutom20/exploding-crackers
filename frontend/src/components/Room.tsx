import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";
import GameLayout from "./GameLayout";
import Header from "./Header";
import { IoCopyOutline } from "react-icons/io5";
import Spinner from "./Spinner";
import { useSnackbar } from "notistack";
import SeeTheFuture from "./SeeTheFuture";
import ExplosionCardPlacement from "./ExplosionCardPlacement";
import ChooseFavor from "./ChooseFavor";
import { MoveType } from "../types";
import Winner from "./Winner";
import ChooseAvatar from "./ChooseAvatar";
function Room() {
  const { roomId } = useParams();
  const { username: usernameFromState } = useLocation().state || "";
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState(usernameFromState ?? "");
  const [, setAvatar] = useState("");
  const [seeTheFutureOpen, setSeeTheFutureOpen] = useState(false);

  console.log("username", username);

  const [players, setPlayers] = useState<
    { username: string; socketId: string; avatar: string }[]
  >([]);

  const [noOfCardsEachPlayer, setNoOfCardsEachPlayer] = useState<
    {
      username: string;
      noOfCards: number;
    }[]
  >([]);

  const [, setCurrentPlayerMove] = useState<string>("");

  const [gameState, setGameState] = useState<any>(null);

  const [, setExplosionCardPlacement] = useState<"top" | "random" | null>(null);

  const [chooseFavorOpen, setChooseFavorOpen] = useState(false);

  const [chooseAvatarOpen, setChooseAvatarOpen] = useState(false);

  const [explosionCardPlacementOpen, setExplosionCardPlacementOpen] =
    useState(false);

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

  const [showWinner, setShowWinner] = useState(false);

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
        setShowWinner(true);
        return;
      }

      if (gameState?.playerHands) {
        setNoOfCardsEachPlayer(
          Object.keys(gameState.playerHands).map((username) => ({
            username,
            noOfCards: gameState?.playerHands[username]?.length,
          }))
        );
      }
      if (gameState.explosionCardAtCurrentPlayer) {
        setCountdownGoing(true);
        if (gameState.currentPlayerTurn === username) {
          enqueueSnackbar(
            "Lose countdown started! , immediately play defuse card to avoid explosion",
            {
              variant: "info",
              anchorOrigin: {
                vertical: "top",
                horizontal: "center",
              },
              autoHideDuration: 5000,
            }
          );
        }
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

  const joinRoom = (avatar: string) => {
    socket.emit("joinRoom", { roomId, username, avatar });
  };

  const startGame = async () => {
    socket.emit("startGame", {
      roomId,
      playerUsernames: players.map((player) => player.username),
    });
  };

  const makeMove = (
    move: MoveType,
    placeExplosionCardInMiddle?: boolean,
    favorFromUsername?: string
  ) => {
    console.log("makeMove", move, placeExplosionCardInMiddle);
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
          placeExplosionCardInMiddle: placeExplosionCardInMiddle ?? false,
        });
      } else if (move === "favor") {
        socket.emit("updateGameState", {
          roomId,
          currentPlayerMove: move,
          playerUsernames: gameState.playersInGame,
          favorFromUsername: favorFromUsername,
        });
      } else {
        socket.emit("updateGameState", {
          roomId,
          currentPlayerMove: move,
          playerUsernames: gameState.playersInGame,
        });
      }
    } else {
      enqueueSnackbar("Not your turn", {
        variant: "warning",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 2000,
      });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  console.log("players", players);

  return (
    <>
      <div className="h-screen bg-white">
        <div className="sticky top-0 z-10">
          <Header
            currentUser={username}
            currentPlayerTurn={gameState?.currentPlayerTurn}
          />
        </div>

        {!gameState && currentPlayerJoined && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-lg my-8 mx-4 p-8 border-8 border-dotted border-light-gray w-fit font-bold">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Players in the Room
              </h3>
              <ul className="list-none space-y-2">
                {players.map((player) => (
                  <li key={player.socketId} className="bg-white p-4">
                    <img
                      src={player.avatar}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-gray-300"
                    />
                    <span className="text-gray-700 text-md">
                      {player.username}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col w-fit">
              {hostUsername === usernameFromState && !gameState && (
                <button
                  onClick={startGame}
                  className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
                >
                  Start Game
                </button>
              )}
              {!gameState && (
                <div className="p-4 rounded-lg mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/room/${roomId}`
                      );
                      enqueueSnackbar("Link copied to clipboard!", {
                        variant: "success",
                        anchorOrigin: {
                          vertical: "top",
                          horizontal: "center",
                        },
                        autoHideDuration: 2000,
                      });
                    }}
                    className="flex items-center gap-2 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
                  >
                    <IoCopyOutline className="text-2xl" />{" "}
                    <span>Invite Link</span>
                  </button>
                  {username !== hostUsername ? (
                    <span className="text-gray-600 italic py-2">
                      Waiting for host to start game
                    </span>
                  ) : (
                    <span className="text-gray-600 italic py-2">
                      Waiting for other players to join
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {gameState && (
          <GameLayout
            countdownGoing={countdownGoing}
            loseCountdown={loseCountdown}
            players={players}
            playersInGame={gameState?.playersInGame}
            noOfCardsEachPlayer={noOfCardsEachPlayer}
            lastPlayedCard={gameState?.lastPlayedCard}
            playerHands={gameState?.playerHands[username]}
            onCardClick={(move: string) => {
              if (move === "future") {
                setSeeTheFutureOpen(true);
              } else if (
                move === "defuse" &&
                gameState?.explosionCardAtCurrentPlayer
              ) {
                setExplosionCardPlacementOpen(true);
                return;
              } else if (move === "favor") {
                setChooseFavorOpen(true);
                return;
              }
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
                onClick={() => {
                  setChooseAvatarOpen(true);
                }}
                className="w-fit mt-2 bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
              >
                Join Room
              </button>
            </div>
          )}
        </>
      </div>
      {seeTheFutureOpen && gameState?.currentPlayerTurn === username && (
        <SeeTheFuture
          setOpen={setSeeTheFutureOpen}
          top3Cards={gameState?.deck?.slice(-3)}
        />
      )}
      {explosionCardPlacementOpen && (
        <ExplosionCardPlacement
          makeMove={makeMove}
          setOpen={setExplosionCardPlacementOpen}
          setExplosionCardPlacement={setExplosionCardPlacement}
        />
      )}
      {chooseFavorOpen && gameState?.currentPlayerTurn === username && (
        <ChooseFavor
          players={players}
          username={username}
          playersInGame={gameState?.playersInGame}
          setOpen={setChooseFavorOpen}
          makeMove={makeMove}
        />
      )}
      {showWinner && (
        <Winner
          hostUsername={hostUsername}
          username={username}
          winner={gameState?.playersInGame[0]}
          setOpen={setShowWinner}
          roomId={roomId ?? ""}
          players={players}
        />
      )}
      {chooseAvatarOpen && (
        <ChooseAvatar
          setOpen={setChooseAvatarOpen}
          setAvatar={setAvatar}
          joinRoom={joinRoom}
        />
      )}
    </>
  );
}

export default Room;
