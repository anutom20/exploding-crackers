import userImage from "/user_image.png";
import { TiTick } from "react-icons/ti";
import { FaSkullCrossbones } from "react-icons/fa6";
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import Attack from "/cards/attack.png";
import Defuse from "/cards/defuse.png";
import Explosion from "/cards/explosion.png";
import Skip from "/cards/skip.png";
import Reverse from "/cards/reverse.png";
import Shuffle from "/cards/shuffle.png";
import Favor from "/cards/favor.png";
import SeeTheFuture from "/cards/future.png";
import { FiPlus } from "react-icons/fi";
import Card from "./Card";

const GameLayout = ({
  playerHands,
  onCardClick,
  currentPlayerTurn,
  playersInGame,
  lastPlayedCard,
  players,
}: {
  playerHands: string[];
  onCardClick: (card: string) => void;
  currentPlayerTurn: string;
  lastPlayedCard: string;
  playersInGame: string[];
  players: { username: string; socketId: string }[];
}) => {
  console.log("players", players);

  const cardImagesMap = {
    attack: Attack,
    defuse: Defuse,
    explosion: Explosion,
    skip: Skip,
    reverse: Reverse,
    shuffle: Shuffle,
    favor: Favor,
    future: SeeTheFuture,
  };

  return (
    <>
      <div className="flex flex-col m-4 items-center h-fit pb-16 bg-white space-y-6 relative">
        <h3 className="text-lg font-medium">{currentPlayerTurn}'s turn</h3>

        <div className="flex flex-row space-x-4 mb-4">
          {players?.map((player) => (
            <div
              key={player.socketId}
              className="flex flex-col space-y-2 items-center"
            >
              {playersInGame.includes(player.username) ? (
                <TiTick className="text-green-500 w-6 h-6" />
              ) : (
                <FaSkullCrossbones className="text-red-500 w-6 h-6" />
              )}
              <div className="relative">
                <img
                  src={userImage}
                  alt="Player Icon"
                  className="w-12 h-12 rounded-full shadow-md z-10"
                />
              </div>
              <span>{player.username}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div
            className="flex flex-col items-center justify-center space-y-2 bg-gray-800 text-white p-3 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-300"
            onClick={() => onCardClick("draw")}
          >
            <h2 className="text-xl">Draw from deck</h2>
            <FiPlus className="w-6 h-6 text-orange-500" size={32} />
          </div>
          <div
            className={`flex flex-col items-center justify-center space-y-2 bg-gray-800 text-white p-3 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 ${
              lastPlayedCard !== "None"
                ? "h-auto"
                : "h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72"
            }   hover:shadow-md hover:scale-105 transition-all duration-300 ${
              lastPlayedCard !== "None" ? "bg-white" : "bg-gray-800"
            }`}
          >
            {lastPlayedCard !== "None" ? (
              <Card
                cardName={lastPlayedCard}
                imageSrc={
                  cardImagesMap[lastPlayedCard as keyof typeof cardImagesMap]
                }
              />
            ) : (
              <h2 className="text-xl">Discard Pile</h2>
            )}
          </div>
        </div>
        <h1 className="text-xl text-gray-700 font-bold">Your cards</h1>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full px-16 mt-8 relative">
          <div className="overflow-x-auto">
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border-2 border-orange-500 text-orange-500 p-2 rounded-full z-10"
              onClick={() => {
                const scrollContainer = document.getElementById("card-scroll");
                if (scrollContainer) {
                  scrollContainer.scrollBy({ left: -100, behavior: "smooth" });
                }
              }}
            >
              <GrPrevious className="w-6 h-6 text-orange-500" />
            </button>
            <div
              id="card-scroll"
              className="flex overflow-x-auto flex-shrink-0 flex-row space-x-3  rounded-lg p-4"
            >
              {playerHands?.map((hand, index) => (
                <div
                  key={index}
                  className="bg-white text-white p-2 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-auto cursor-pointer flex-shrink-0 hover:shadow-md hover:scale-105 transition-all duration-300 overflow-hidden"
                  onClick={() => onCardClick(hand)}
                >
                  <Card
                    cardName={hand}
                    imageSrc={cardImagesMap[hand as keyof typeof cardImagesMap]}
                  />
                </div>
              ))}
            </div>
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border-2 border-orange-500 text-orange-500 p-2 rounded-full z-10"
              onClick={() => {
                const scrollContainer = document.getElementById("card-scroll");
                if (scrollContainer) {
                  scrollContainer.scrollBy({ left: 100, behavior: "smooth" });
                }
              }}
            >
              <GrNext className="w-6 h-6 text-orange-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameLayout;
