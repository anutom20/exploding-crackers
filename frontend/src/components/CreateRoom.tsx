import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import Background from "../../public/background.png";

function CreateRoom() {
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");

  const navigate = useNavigate();

  const createRoom = async () => {
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
    <div className="relative min-h-screen bg-gradient-to-r from-black to-orange-800 flex">
      <div className="relative flex flex-col justify-center items-start space-y-6 p-8 animate-fadeIn w-1/2">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">
          Pop! Crackle! Let the firecrackers fly!
        </h1>
        <p className="text-lg text-white mb-6">
          Join the very fun Exploding Kittens game and experience thrilling
          matches!
        </p>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-orange-500 p-3 rounded-lg w-80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />
        <button
          onClick={createRoom}
          className="bg-orange-500 text-black p-3 rounded-lg hover:bg-orange-600 hover:text-white transition transform hover:scale-105"
        >
          Create Room
        </button>
        <p className="text-center text-white">{text}</p>
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <div className="transform rotate-3 overflow-hidden shadow-lg rounded-lg w-4/5 h-auto">
          <img
            src={Background}
            alt="Exploding Kittens"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
