import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useEffect, useReducer } from "react";
import { initialState } from "../audioReducer";
import { soundReducer } from "../audioReducer";
import { useSnackbar } from "notistack";
const Header = ({
  currentUser,
  currentPlayerTurn,
  currentPlayerTurnAgain,
  playersInGame,
  elimiateCountdown,
  gameInProgress,
  players,
  roomId,
}: {
  currentUser: string;
  currentPlayerTurn: string;
  currentPlayerTurnAgain: boolean;
  playersInGame: string[];
  elimiateCountdown: number | null;
  gameInProgress: boolean;
  players: { username: string; avatar: string }[];
  roomId: string;
}) => {
  const [, dispatch] = useReducer(soundReducer, initialState);

  console.log("currentPlayerTurnAgain", currentPlayerTurnAgain);

  useEffect(() => {
    if (elimiateCountdown && elimiateCountdown === 5) {
      dispatch({ type: "ELIMINATE_CLOCK" });
    }
    if (elimiateCountdown && elimiateCountdown === 0) {
      socket.emit("gameNotification", {
        roomId,
        player: currentUser,
        avatar: players.find((player) => player.username === currentUser)
          ?.avatar,
        message: `${currentUser} has been eliminated!`,
      });
    }
  }, [elimiateCountdown]);

  useEffect(() => {
    if (
      currentPlayerTurn === currentUser ||
      (currentPlayerTurnAgain && currentPlayerTurn === currentUser)
    ) {
      dispatch({ type: "TURN_SOUND" });
    }
  }, [currentPlayerTurn, currentPlayerTurnAgain]);
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!playersInGame?.includes(currentUser) && gameInProgress) {
      enqueueSnackbar("You have been eliminated!", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }
  }, [playersInGame, gameInProgress]);

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:justify-between items-center bg-white shadow-sm p-2 sm:p-4 border-b-2 w-full">
      <div className="flex flex-row items-center gap-4">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => {
            socket.disconnect();
            navigate("/");
          }}
        >
          Exploding <span className="text-orange-500">Chickens</span>
        </h1>
      </div>
      {elimiateCountdown && gameInProgress && (
        <p
          className={`text-md text-gray-500 ${
            elimiateCountdown <= 5 ? "text-red-500" : ""
          }`}
        >
          {Math.floor(elimiateCountdown)}s
        </p>
      )}
      <div
        className={`p-2 z-50 text-white rounded-lg shadow-lg transition-opacity duration-300 ${
          playersInGame?.length === 0
            ? "opacity-0"
            : currentPlayerTurn === currentUser
            ? "bg-green-500"
            : !playersInGame?.includes(currentUser)
            ? "bg-red-500"
            : "bg-orange-500"
        }`}
      >
        {playersInGame?.length === 0
          ? "opacity-0"
          : !playersInGame?.includes(currentUser)
          ? "You are eliminated!"
          : currentPlayerTurnAgain && currentPlayerTurn === currentUser
          ? "Your Turn Again!"
          : currentPlayerTurn === currentUser
          ? "Your Turn!"
          : `${currentPlayerTurn}'s Turn!`}
      </div>
      <p className="text-md sm:text-lg text-gray-500 flex text-right">
        Welcome, {currentUser}!
      </p>
    </div>
  );
};

export default Header;
