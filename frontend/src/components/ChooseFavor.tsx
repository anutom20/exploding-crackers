import UserImage from "/user_image.png";
import { MoveType } from "../types";

const ChooseFavor = ({
  players,
  playersInGame,
  setOpen,
  username,
  makeMove,
}: {
  players: { username: string; socketId: string; avatar: string }[];
  playersInGame: string[];
  setOpen: (open: boolean) => void;
  username: string;
  makeMove: (
    move: MoveType,
    placeExplosionCardInMiddle?: boolean,
    favorFromUsername?: string
  ) => void;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold text-gray-600">
          Choose Favor From a Player
        </h1>
        <div className="flex flex-col justify-between mt-4 p-4">
          {players
            ?.filter(
              (player) =>
                player.username !== username &&
                playersInGame.includes(player.username)
            )
            .map((player) => (
              <div
                key={player.username}
                onClick={() => {
                  makeMove("favor", false, player.username);
                  setOpen(false);
                }}
                className="flex items-center mb-2 p-2 cursor-pointer hover:bg-gray-200"
              >
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <span className="text-gray-700">{player.username}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseFavor;
