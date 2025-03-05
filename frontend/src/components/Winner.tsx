import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
const Winner = ({
  winner,
  setOpen,
  roomId,
  players,
  hostUsername,
  username,
  setEliminateCountdown,
}: {
  winner: string;
  setOpen: (open: boolean) => void;
  roomId: string;
  players: { username: string; socketId: string; avatar: string }[];
  hostUsername: string;
  username: string;
  setEliminateCountdown: (countdown: number) => void;
}) => {
  useEffect(() => {
    socket.on("gameStarted", () => {
      setOpen(false);
    });
    socket.emit("playCardSound", {
      roomId,
      type: "CONGRATS",
    });
    setTimeout(() => {
      setShowConfetti(true);
    }, 5000);
  }, []);
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-row justify-center items-center">
          <img
            src={players.find((player) => player.username === winner)?.avatar}
            alt={`${winner}'s avatar`}
            className="w-12 h-12 rounded-full mr-2"
          />
          <h1 className="text-lg font-semibold text-gray-600">
            Congratulations, {winner} is the winner!!
          </h1>
        </div>
        <div className="flex flex-row mt-4 gap-4">
          {username === hostUsername ? (
            <button
              className="bg-orange-500 text-white p-2 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-auto"
              onClick={() => {
                setEliminateCountdown(import.meta.env.VITE_ELIMINATE_COUNTDOWN);
                socket.emit("startGame", {
                  roomId,
                  playerUsernames: players.map((player) => player.username),
                  minPlayers: import.meta.env.VITE_MIN_PLAYERS,
                  maxPlayers: import.meta.env.VITE_MAX_PLAYERS,
                });
                setOpen(false);
              }}
            >
              Play another
            </button>
          ) : (
            <span className="text-gray-600 italic">
              Waiting for host to start another game
            </span>
          )}

          <button
            className="bg-orange-500 text-white p-2 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-auto"
            onClick={() => {
              setOpen(false);
              socket.disconnect();
              navigate("/");
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
      {showConfetti && <Confetti />}
    </div>
  );
};

export default Winner;
