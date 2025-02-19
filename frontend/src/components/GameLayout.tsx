import { TiTick } from "react-icons/ti";
import { FaSkullCrossbones } from "react-icons/fa6";
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import { useEffect } from "react";
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
import { PiClockCountdownBold } from "react-icons/pi";
import { socket } from "../socket";

const GameLayout = ({
  gameCompleted,
  playerHands,
  setEliminateCountdown,
  onCardClick,
  currentPlayerTurn,
  playersInGame,
  lastPlayedCard,
  countdownGoing,
  loseCountdown,
  players,
  noOfCardsEachPlayer,
  username,
  setEliminateTimeoutId,
}: {
  gameCompleted: boolean;
  playerHands: string[];
  setEliminateCountdown: React.Dispatch<React.SetStateAction<number>>;
  onCardClick: (card: string) => void;
  currentPlayerTurn: string;
  lastPlayedCard: string;
  playersInGame: string[];
  players: { username: string; socketId: string; avatar: string }[];
  countdownGoing: boolean;
  loseCountdown: number;
  noOfCardsEachPlayer: { username: string; noOfCards: number }[];
  username: string;
  setEliminateTimeoutId: (id: number | null) => void;
}) => {
  console.log("players", players);

  console.log("lastPlayedCard", lastPlayedCard);

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

  useEffect(() => {
    let timer: number;
    setEliminateCountdown(import.meta.env.VITE_ELIMINATE_COUNTDOWN);
    if (currentPlayerTurn === username && !gameCompleted) {
      timer = setInterval(() => {
        setEliminateCountdown((prev: number) => {
          console.log("prev", prev);
          if (prev - 1 === 0) {
            socket.emit("eliminate_player", { username, playersInGame });
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);
      setEliminateTimeoutId(timer);
    }
    return () => clearInterval(timer);
  }, [currentPlayerTurn, gameCompleted]);

  return (
    <>
      <div className="flex flex-col p-4 items-center h-fit pb-16 bg-white space-y-6 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                  src={player.avatar}
                  alt="Player Icon"
                  className="w-12 h-12 rounded-full shadow-md z-10"
                />
              </div>
              <span>{player.username}</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {playersInGame.includes(player.username)
                  ? noOfCardsEachPlayer.find(
                      (item) => item.username === player.username
                    )?.noOfCards
                  : 0}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          {countdownGoing && (
            <h4 className="text-red-600 font-bold flex items-center gap-2">
              <PiClockCountdownBold className="text-2xl" /> Lose Countdown:{" "}
              {loseCountdown}
            </h4>
          )}
          <div
            className="flex flex-col items-center justify-center space-y-2 bg-gray-800 text-white p-3 rounded-xl w-40 md:w-48 lg:w-56 h-44 sm:h-48 md:h-56 lg:h-64 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-300"
            onClick={() => onCardClick("draw")}
          >
            <h2 className="text-xl">Draw from deck</h2>
            <FiPlus className="w-6 h-6 text-orange-500" size={32} />
          </div>
          <div
            className={`flex flex-col items-center justify-center space-y-2 bg-gray-800 text-white p-3 rounded-xl w-40 md:w-48 lg:w-56 ${
              lastPlayedCard !== "None" &&
              lastPlayedCard !== "Card drawn from deck"
                ? "h-auto"
                : "h-40 sm:h-48 md:h-56 lg:h-56"
            }   hover:shadow-md hover:scale-105 transition-all duration-300 ${
              lastPlayedCard !== "None" &&
              lastPlayedCard !== "Card drawn from deck"
                ? "bg-white"
                : "bg-gray-800"
            }`}
          >
            {lastPlayedCard !== "None" &&
            lastPlayedCard !== "Card drawn from deck" ? (
              <div className="flex flex-col items-center justify-center space-y-2 bg-white text-white p-2 rounded-xl w-40 md:w-48 lg:w-56 h-auto">
                <Card
                  cardName={lastPlayedCard}
                  imageSrc={
                    cardImagesMap[lastPlayedCard as keyof typeof cardImagesMap]
                  }
                />
              </div>
            ) : (
              <h2 className="text-xl">
                {lastPlayedCard === "None"
                  ? "Discard Pile"
                  : "Card drawn from deck"}
              </h2>
            )}
          </div>
        </div>
        <h1 className="text-xl text-gray-700 font-bold">Your cards</h1>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full px-16 mt-8 relative">
          <div className="overflow-x-auto bg-white">
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
                  className="bg-white text-white p-3 rounded-xl w-40 md:w-48 lg:w-56 h-auto cursor-pointer flex-shrink-0 hover:shadow-md hover:scale-105 transition-all duration-300 overflow-hidden"
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
