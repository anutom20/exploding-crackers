import Card from "./Card";

import Attack from "/cards/attack.png";
import Defuse from "/cards/defuse.png";
import Explosion from "/cards/explosion.png";
import Skip from "/cards/skip.png";
import Reverse from "/cards/reverse.png";
import Shuffle from "/cards/shuffle.png";
import Favor from "/cards/favor.png";
import Future from "/cards/future.png";
import { FaArrowRightLong } from "react-icons/fa6";

const SeeTheFuture = ({
  setOpen,
  top3Cards,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  top3Cards: string[];
}) => {
  const cardImagesMap = {
    attack: Attack,
    defuse: Defuse,
    explosion: Explosion,
    skip: Skip,
    reverse: Reverse,
    shuffle: Shuffle,
    favor: Favor,
    future: Future,
  };
  return (
    <div className="absolute top-0 bg-black bg-opacity-50 w-full h-[130vh] flex items-center justify-center">
      <div className="p-4 w-auto h-auto border-2 rounded-xl flex flex-col items-center justify-center space-y-2 bg-white transition-all duration-300">
        <h2 className="text-xl">See the Future</h2>
        <h3 className="text-md text-gray-500 flex items-center gap-2 justify-center">
          Top 3 cards in the deck are shown from left to right{" "}
          <FaArrowRightLong className="text-gray-500" />
        </h3>
        <div className="flex flex-row space-x-2">
          {top3Cards
            .slice(0, 3)
            .reverse()
            .map((card, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-2 bg-white text-white p-2 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-auto"
              >
                <Card
                  cardName={card}
                  imageSrc={cardImagesMap[card as keyof typeof cardImagesMap]}
                />
              </div>
            ))}
        </div>
        <button
          className="bg-orange-500 text-white p-2 rounded-xl w-full sm:w-28 md:w-36 lg:w-48 xl:w-56 h-auto"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SeeTheFuture;
