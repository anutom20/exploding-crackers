import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import Background from "../../public/background.png";
import ChooseAvatar from "./ChooseAvatar";
import attack from "/cards/attack.png";
import defuse from "/cards/defuse.png";
import explosion from "/cards/explosion.png";
import favor from "/cards/favor.png";
import future from "/cards/future.png";
import reverse from "/cards/reverse.png";
import shuffle from "/cards/shuffle.png";
import skip from "/cards/skip.png";

import Card from "./Card";

import { FaLinkedinIn } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { SiGmail } from "react-icons/si";
import { FaInstagram } from "react-icons/fa6";

const howToPLayInfo = [
  {
    title: "Understanding the basics",
    description:
      "Exploding Chickens is a card game based on both luck and strategy. Throughout the game, you draw cards from the deck which can either secure your victory or lead to your explosive demise. Action cards help give you an advantage over your opponents. But beware: the deadly Exploding Chicken is also hidden in the mix.",
    cards: [
      { cardName: "defuse", imageSrc: defuse },
      { cardName: "skip", imageSrc: skip },
      { cardName: "explosion", imageSrc: explosion },
    ],
  },
  {
    title: "Taking your Turn",
    description:
      "At the start of your turn, you can play as many (or as few) action cards as you’d like. That is, as long as the circumstances permit. Some unique cards will allow you to skip your turn entirely while others can force you to draw multiple times. Just follow the cards instructions below on how to play each action card. End your turn by drawing a card from the deck.",
    cards: [
      { cardName: "attack", imageSrc: attack },
      { cardName: "favor", imageSrc: favor },
      { cardName: "future", imageSrc: future },
    ],
  },
  {
    title: "Drawing an Exploding Chicken",
    description:
      "When you continue drawing card after card in the game, there comes a point where someone will draw an Exploding Chicken. If that’s you, you have two options: defuse the ticking time bomb or say goodbye to your chances of winning. The number of Exploding Chickens is always one less than the number of players alive.",
    cards: [{ cardName: "explosion", imageSrc: explosion }],
  },
  {
    title: "Winner Winner Chicken Dinner!",
    description:
      "Winning the game is pretty simple. Use whatever cards at your disposal, combined with your smarts, to be the last person alive. After you witness each of your friends fall one by one to the wrath of the Exploding Chicken, congratulations! You’ve claimed the bragging rights to one of the most explosive games on the planet. Don’t let them forget.",
    cards: [
      { cardName: "shuffle", imageSrc: shuffle },
      { cardName: "reverse", imageSrc: reverse },
    ],
  },
];

const cardDescriptions = [
  {
    cardName: "shuffle",
    imageSrc: shuffle,
    description:
      "Shuffles the deck to hopefully decrease your odds at drawing an Exploding Chicken. Plain and simple. Does not count as a turn.",
  },
  {
    cardName: "reverse",
    imageSrc: reverse,
    description:
      "Skips your turn and reverses the turn direction, all without having to draw a card. If you are stuck with multiple turns, the reverse card only removes one turn.",
  },
  {
    cardName: "explosion",
    imageSrc: explosion,
    description:
      "Avoid this little guy at all costs. Once this card is drawn, you must use a defuse card to stop the ticking time bomb. If you don't have a defuse card, it looks like your time is up.",
  },
  {
    cardName: "defuse",
    imageSrc: defuse,
    description:
      "Clip the wires and stop the Exploding Chicken from exploding. Once defused, the player puts the Exploding Chicken back in the deck wherever they'd like.",
  },
  {
    cardName: "attack",
    imageSrc: attack,
    description:
      "Seek vengeance on your friends by forcing the next player in line to take 2 turns. Attack cards can be stacked to force the next player to take 4, 6, and even 8+ turns.",
  },
  {
    cardName: "favor",
    imageSrc: favor,
    description:
      "Allows you to ask for a favor (aka steal a card) from anyone still in the game. Your target really can't do much about it. Does not count as a turn.",
  },
  {
    cardName: "future",
    imageSrc: future,
    description:
      "Allow yourself to see the top three cards in the deck. Be quick though, because you only have 5 seconds. Does not count as a turn.",
  },
  {
    cardName: "skip",
    imageSrc: skip,
    description:
      "Effectively skips your turn without having to draw a card. If you are stuck with multiple turns, the skip card only removes one turn.",
  },
];

function CreateRoom() {
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [chooseAvatarOpen, setChooseAvatarOpen] = useState(false);
  const [avatar, setAvatar] = useState("");

  const navigate = useNavigate();

  const createRoom = async (avatar: string) => {
    if (!username) {
      alert("Please enter a username");
      return;
    }
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/api/create-room`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    socket.emit("joinRoom", {
      roomId: data.roomId,
      username: username,
      avatar: avatar,
      host: true,
    });

    setText("Creating new room...");

    navigate(`/room/${data.roomId}`, {
      state: {
        username: username,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-orange-800 px-12 py-24 font-semibold space-y-12">
      <div className="flex flex-row">
        <div className="flex flex-col justify-center items-start space-y-8 w-1/2">
          <h1 className="text-5xl font-bold text-white mb-2">
            Welcome to
            <span className="bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
              {" "}
              Exploding Chickens!
            </span>
          </h1>
          <h1 className="text-5xl font-bold text-white mb-4">
            Let's{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
              Play!
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 font-semibold">
            A beautiful, online alternative to the popular Exploding Kittens
            card game (just with chickens)
          </p>
          <div className="flex flex-row space-x-4">
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-gray-500 p-3 rounded-lg w-80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <button
              onClick={() => {
                setChooseAvatarOpen(true);
              }}
              className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            >
              Create Room
            </button>
          </div>
          <p className="text-center text-white">{text}</p>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <div className="transform rotate-3 overflow-hidden shadow-lg rounded-lg w-4/5 h-auto transition-transform duration-700 hover:scale-105 hover:rotate-6">
            <img
              src={Background}
              alt="Exploding Chickens"
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center mt-8">
        <h2 className="text-5xl font-bold mb-4 text-yellow-500">
          How to
          <span className="bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
            {" "}
            Play
          </span>
        </h2>
        <p className="text-xl text-white mb-4">
          The first rule of Exploding Chickens is simple. Don't explode.
        </p>
        <h3 className="text-3xl font-semibold text-white mb-2">
          Game Structure
        </h3>
        <p className="text-xl text-white">
          2-6 players per room. 7 min average play time.
        </p>
      </div>
      <div className="flex flex-col gap-12 mt-12">
        {howToPLayInfo.map((info, index) => (
          <HowToPlay key={index} info={info} order={index % 2} num={index} />
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-24">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
          Base Cards
        </h2>
        <p className="text-xl text-white">
          These cards are the core of the game. They are the cards that you will
          use to win the game.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3">
        {cardDescriptions.map((card, index) => (
          <CardDescription
            key={index}
            cardName={card.cardName}
            imageSrc={card.imageSrc}
            description={card.description}
          />
        ))}
      </div>
      {chooseAvatarOpen && (
        <ChooseAvatar
          setOpen={setChooseAvatarOpen}
          setAvatar={setAvatar}
          joinRoom={createRoom}
        />
      )}
      <footer className="text-white my-5 text-center">
        <div className="flex flex-col items-center space-y-4">
          <p className="flex items-center">
            <SiGmail className="mr-2" />
            Email:{" "}
            <a
              href="mailto:anuragkt20@gmail.com"
              className="hover:text-orange-500"
            >
              anuragkt20@gmail.com
            </a>
          </p>
          <p className="flex items-center">
            <FaGithub className="mr-2" />
            <a
              href="https://github.com/anutom20"
              className="hover:text-orange-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
          <p className="flex items-center">
            <FaLinkedinIn className="mr-2" />
            <a
              href="https://www.linkedin.com/in/anurag-tomar-2a26b51b3/"
              className="hover:text-orange-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <p className="flex items-center">
            <SiLeetcode className="mr-2" />
            <a
              href="https://leetcode.com/u/anuragkt20/"
              className="hover:text-orange-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              LeetCode
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

const HowToPlay = ({
  info,
  order,
  num,
}: {
  info: any;
  order: number;
  num: number;
}) => {
  return (
    <div className="flex flex-row mt-8">
      {order === 0 && (
        <>
          <div className="flex flex-row justify-center items-start space-x-4 w-1/2">
            <span className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
              {num + 1}
            </span>
            <div className="flex flex-col space-y-6">
              <span className="text-3xl font-semibold text-white">
                {info.title}
              </span>
              <p className="text-lg text-gray-400">{info.description}</p>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center">
            <div className="flex -space-x-4">
              {info.cards.map((card: any, index: number) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center bg-white p-2 rounded-xl w-full md:w-28 lg:w-36 xl:w-48 h-auto transition-transform duration-300 ease-in-out hover:scale-105 ${
                    index === 0 ? "transform -rotate-6" : ""
                  } ${index === 2 ? "transform rotate-6" : ""}`}
                >
                  <Card cardName={card.cardName} imageSrc={card.imageSrc} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {order === 1 && (
        <>
          <div className="w-1/2 flex justify-center items-center">
            <div className="flex -space-x-4">
              {info.cards.map((card: any, index: number) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center bg-white p-2 rounded-xl w-full md:w-28 lg:w-36 xl:w-48 h-auto transition-transform duration-300 ease-in-out hover:scale-105 ${
                    index === 0 ? "transform -rotate-6" : ""
                  } ${index === 2 ? "transform rotate-6" : ""}`}
                >
                  <Card cardName={card.cardName} imageSrc={card.imageSrc} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-row justify-center items-start space-x-4 w-1/2">
            <span className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
              {num + 1}
            </span>
            <div className="flex flex-col space-y-6">
              <span className="text-3xl font-semibold text-white">
                {info.title}
              </span>
              <p className="text-lg text-gray-400">{info.description}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CardDescription = ({
  cardName,
  imageSrc,
  description,
}: {
  cardName: string;
  imageSrc: string;
  description: string;
}) => {
  return (
    <div className="flex flex-row justify-center space-x-4">
      <div
        className={`flex flex-col items-center justify-center bg-white min-w-28 md:min-w-28 lg:min-w-36 xl:min-w-48 p-2 rounded-xl h-auto transition-transform duration-300 ease-in-out hover:scale-105`}
      >
        <Card cardName={cardName} imageSrc={imageSrc} />
      </div>
      <div className="text-gray-400">
        <h2
          className={`${
            cardName === "explosion"
              ? "bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text"
              : "text-white"
          } font-bold text-xl`}
        >
          {cardName}
        </h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default CreateRoom;
