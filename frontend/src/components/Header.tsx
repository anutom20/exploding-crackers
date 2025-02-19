import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
const Header = ({
  currentUser,
  currentPlayerTurn,
  playersInGame,
  elimiateCountdown,
  gameInProgress,
}: {
  currentUser: string;
  currentPlayerTurn: string;
  playersInGame: string[];
  elimiateCountdown: number | null;
  gameInProgress: boolean;
}) => {
  const navigate = useNavigate();
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
        <p className="text-md text-gray-500">
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
          : currentPlayerTurn === currentUser
          ? "Your Turn!"
          : !playersInGame?.includes(currentUser)
          ? "You have been eliminated!"
          : `${currentPlayerTurn}'s Turn!`}
      </div>
      <p className="text-md sm:text-lg text-gray-500 flex text-right">
        Welcome, {currentUser}!
      </p>
    </div>
  );
};

export default Header;
