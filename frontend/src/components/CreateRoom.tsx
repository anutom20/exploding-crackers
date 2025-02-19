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

const howToPLayInfo = [
  {
    title: "Understanding the basics",
    description:
      "Exploding Chickens is a card game that combines elements of luck and strategy. As you play, you'll draw cards from the deck that can either lead you to victory or result in your explosive downfall. Action cards provide you with an edge over your rivals. However, be cautious: the treacherous Exploding Chicken is lurking in the deck.",
    cards: [
      { cardName: "defuse", imageSrc: defuse },
      { cardName: "skip", imageSrc: skip },
      { cardName: "explosion", imageSrc: explosion },
    ],
  },
  {
    title: "Taking your Turn",
    description:
      "At the beginning of your turn, you have the freedom to play as many action cards as you wish, or none at all, depending on the situation. Certain special cards may allow you to completely skip your turn, while others might require you to draw multiple cards. Just adhere to the instructions on the cards below for guidance on how to utilize each action card. Conclude your turn by drawing a card from the deck.",
    cards: [
      { cardName: "attack", imageSrc: attack },
      { cardName: "favor", imageSrc: favor },
      { cardName: "future", imageSrc: future },
    ],
  },
  {
    title: "Drawing an Exploding Chicken",
    description:
      "As you keep drawing cards throughout the game, there will inevitably come a moment when someone draws an Exploding Chicken. If that unfortunate player is you, you have two choices: defuse the ticking time bomb or forfeit your chances of winning. The total number of Exploding Chickens is always one less than the number of players still in the game.",
    cards: [{ cardName: "explosion", imageSrc: explosion }],
  },
  {
    title: "Winner Winner Chicken Dinner!",
    description:
      "Winning the game is quite straightforward. Utilize any cards at your disposal, along with your cleverness, to be the last player standing. After watching your friends fall one by one to the might of the Exploding Chicken, congratulations! You’ve earned the bragging rights to one of the most explosive games on the planet. Make sure they remember it.",
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
      "Shuffles the deck in hopes of lowering your chances of drawing an Exploding Chicken. It's straightforward and does not count as a turn.",
  },
  {
    cardName: "reverse",
    imageSrc: reverse,
    description:
      "Bypasses your turn and changes the direction of play, all without needing to draw a card. If you have multiple turns, the reverse card only cancels one of them.",
  },
  {
    cardName: "explosion",
    imageSrc: explosion,
    description:
      "Steer clear of this card at all costs. Once drawn, you must play a defuse card to neutralize the ticking time bomb. If you lack a defuse card, it seems your time has run out.",
  },
  {
    cardName: "defuse",
    imageSrc: defuse,
    description:
      "Cut the wires to prevent the Exploding Chicken from detonating. After defusing, the player can place the Exploding Chicken back into the deck wherever they choose.",
  },
  {
    cardName: "attack",
    imageSrc: attack,
    description:
      "Exact your revenge on your friends by compelling the next player to take 2 turns. Attack cards can be combined to make the next player take 4, 6, or even more turns.",
  },
  {
    cardName: "favor",
    imageSrc: favor,
    description:
      "Enables you to request a favor (essentially steal a card) from any player still in the game. Your target has little recourse",
  },
  {
    cardName: "future",
    imageSrc: future,
    description:
      "Grants you the ability to view the top three cards in the deck. Be swift, as you only have 5 seconds. This does not count as a turn.",
  },
  {
    cardName: "skip",
    imageSrc: skip,
    description:
      "Allows you to skip your turn without needing to draw a card. If you have multiple turns, the skip card only eliminates one of them.",
  },
];

function CreateRoom() {
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");
  const [chooseAvatarOpen, setChooseAvatarOpen] = useState(false);
  const [, setAvatar] = useState("");

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
      maxPlayers: import.meta.env.VITE_MAX_PLAYERS,
      currentPlayers: 0,
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
        <div className="flex flex-col justify-center items-start space-y-8 w-full md:w-1/2">
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
          <div className="flex flex-col md:flex-row space-x-4 space-y-4 md:space-y-0">
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-gray-500 p-3 rounded-lg w-fit text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
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
        <div className="hidden md:flex w-1/2 justify-center items-center">
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
          The first rule of Exploding Chickens is simple. Don't explode. Each
          player takes turns drawing and playing cards. If any player dosen't
          have a defuse card when they draw an explosion card, they explode. The
          game ends when there is only one player left. If the player dosen't
          play a move for 30 seconds , they're eliminated
        </p>
        <h3 className="text-3xl font-semibold  mb-2 mt-4 bg-gradient-to-r from-yellow-500 to-red-500 text-transparent bg-clip-text">
          Game Structure
        </h3>
        <p className="text-xl text-white">
          2-5 players per room. 7 min average play time.
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
          These cards form the foundation of the game. They are the essential
          cards you'll utilize to achieve victory.
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
          <div className="flex flex-row justify-center items-start space-x-4 w-full md:w-1/2">
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
          <div className="hidden md:flex w-1/2 justify-center items-center">
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
          <div className="hidden md:flex w-1/2 justify-center items-center">
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
          <div className="flex flex-row justify-center items-start space-x-4 w-full md:w-1/2">
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
    <div className="flex flex-col sm:flex-row justify-center space-x-4 space-y-4 md:space-y-0">
      <div
        className={`flex flex-col items-center justify-center bg-white sm:min-w-24 md:min-w-28 lg:min-w-36 xl:min-w-48 p-2 rounded-xl h-auto transition-transform duration-300 ease-in-out hover:scale-105`}
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
