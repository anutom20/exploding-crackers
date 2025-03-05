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
import { initialState, soundReducer } from "../audioReducer";
import { useReducer } from "react";
import GameNotifications from "./GameNotifications";

function Room() {
  const [, dispatch] = useReducer(soundReducer, initialState);
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

  const [eliminateTimeoutId, setEliminateTimeoutId] = useState<number | null>(
    null
  );
  const [eliminateCountdown, setEliminateCountdown] = useState<number>(
    import.meta.env.VITE_ELIMINATE_COUNTDOWN
  );

  useEffect(() => {
    if (gameState?.playersInGame?.length === 1 && !gameState?.gameCompleted) {
      socket.emit("gameCompleted", roomId);
    }
  }, [gameState]);

  useEffect(() => {
    if (
      gameState?.explosionCardAtCurrentPlayer &&
      username === gameState?.currentPlayerTurn
    ) {
      socket.emit("gameNotification", {
        roomId,
        player: username,
        avatar: players.find((player) => player.username === username)?.avatar,
        message: `${username} drew a chicken card`,
      });
      socket.emit("playCardSound", {
        roomId,
        type: "CHICKEN_CARD",
      });
    }
  }, [gameState?.explosionCardAtCurrentPlayer]);

  useEffect(() => {
    socket.on("error", (error) => {
      enqueueSnackbar(error, {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 2500,
      });
    });

    socket.on("playCardSound", ({ type }) => {
      dispatch({ type });
    });

    socket.on("gameNotification", (notification) => {
      enqueueSnackbar(notification?.message, {
        variant: "info",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        content: (
          <GameNotifications
            message={notification?.message}
            avatar={notification?.avatar}
            username={notification?.player}
          />
        ),
        autoHideDuration: 3000,
      });
    });

    socket.on("gameStateUpdate", (gameState) => {
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
    } else if (
      countdownGoing &&
      loseCountdown === 0 &&
      username === gameState?.currentPlayerTurn
    ) {
      socket.emit("stopCountdownRequest", roomId);
      socket.emit("updateGameState", {
        roomId,
        currentPlayerMove: "explosion",
        playerUsernames: gameState.playersInGame,
      });
      socket.emit("playCardSound", {
        roomId,
        type: "EXPLOSION",
      });
      socket.emit("gameNotification", {
        roomId,
        avatar: players.find((player) => player.username === username)?.avatar,
        player: username,
        message: `${username} exploded`,
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
    socket.emit("joinRoom", {
      roomId,
      username,
      avatar,
      maxPlayers: import.meta.env.VITE_MAX_PLAYERS,
    });
  };

  const startGame = async () => {
    setEliminateCountdown(import.meta.env.VITE_ELIMINATE_COUNTDOWN);
    socket.emit("startGame", {
      roomId,
      playerUsernames: players.map((player) => player.username),
      minPlayers: import.meta.env.VITE_MIN_PLAYERS,
      maxPlayers: import.meta.env.VITE_MAX_PLAYERS,
    });
  };

  const makeMove = (
    move: MoveType,
    placeExplosionCardInMiddle?: boolean,
    favorFromUsername?: string
  ) => {
    console.log("makeMove", move, placeExplosionCardInMiddle);
    if (gameState?.currentPlayerTurn === username) {
      if (
        gameState?.explosionCardAtCurrentPlayer &&
        move !== "defuse" &&
        move !== "hot_potato"
      ) {
        alert(
          "Only defuse or hot potato card can be played when explosion card is at current player"
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
      return 1;
    } else {
      enqueueSnackbar("Not your turn", {
        variant: "warning",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 2000,
      });
      return 0;
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
            currentPlayerTurnAgain={gameState?.currentPlayerTurnAgain}
            playersInGame={gameState?.playersInGame ?? []}
            elimiateCountdown={eliminateCountdown}
            gameInProgress={gameState ? true : false}
          />
        </div>

        {!gameState && currentPlayerJoined && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-lg my-8 mx-4 p-8 border-8 border-dotted border-light-gray w-fit font-bold">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Players in the Room
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <li
                    key={player.socketId}
                    className="bg-white p-4 flex items-center"
                  >
                    <img
                      src={player.avatar}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-gray-300 mr-2"
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
            gameCompleted={gameState?.gameCompleted}
            setEliminateCountdown={setEliminateCountdown}
            countdownGoing={countdownGoing}
            loseCountdown={loseCountdown}
            players={players}
            setEliminateTimeoutId={setEliminateTimeoutId}
            playersInGame={gameState?.playersInGame}
            noOfCardsEachPlayer={noOfCardsEachPlayer}
            lastPlayedCard={gameState?.lastPlayedCard}
            playerHands={gameState?.playerHands[username]}
            username={username}
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
              const result = makeMove(move as MoveType);
              if (result === 0) {
                return;
              }
              if (eliminateTimeoutId) {
                clearInterval(eliminateTimeoutId);
                setEliminateTimeoutId(null);
              }
              if (move === "shuffle") {
                socket.emit("playCardSound", {
                  roomId,
                  type: "SHUFFLE",
                });
              } else {
                socket.emit("playCardSound", {
                  roomId,
                  type: "PLAY_CARD",
                });
              }

              if (move === "hot_potato") {
                socket.emit("gameNotification", {
                  roomId,
                  player: username,
                  avatar: players.find((player) => player.username === username)
                    ?.avatar,
                  message: gameState?.explosionCardAtCurrentPlayer
                    ? `${username} played hot potato , exploding chicken is passed to next player`
                    : `${username} played hot potato`,
                });
              }

              if (move !== "draw") {
                socket.emit("gameNotification", {
                  roomId,
                  player: username,
                  avatar: players.find((player) => player.username === username)
                    ?.avatar,
                  message: `${username} played ${move}`,
                });
              } else {
                socket.emit("gameNotification", {
                  roomId,
                  player: username,
                  avatar: players.find((player) => player.username === username)
                    ?.avatar,
                  message: `${username} drew a card`,
                });
              }
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
          setEliminateTimeoutId={setEliminateTimeoutId}
          eliminateTimeoutId={eliminateTimeoutId}
          roomId={roomId ?? ""}
          players={players}
          username={username}
        />
      )}
      {chooseFavorOpen && gameState?.currentPlayerTurn === username && (
        <ChooseFavor
          players={players}
          roomId={roomId ?? ""}
          username={username}
          playersInGame={gameState?.playersInGame}
          setOpen={setChooseFavorOpen}
          makeMove={makeMove}
          setEliminateTimeoutId={setEliminateTimeoutId}
          eliminateTimeoutId={eliminateTimeoutId}
        />
      )}
      {showWinner && (
        <Winner
          setEliminateCountdown={setEliminateCountdown}
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
