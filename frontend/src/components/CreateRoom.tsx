import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

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

    setTimeout(() => {
      navigate(`/room/${data.roomId}`, {
        state: {
          username: username,
        },
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border-2 border-blue-500 p-2 rounded-lg w-64"
      />
      <button
        onClick={createRoom}
        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
      >
        Create Room
      </button>
      <p className="text-center">{text}</p>
    </div>
  );
}

export default CreateRoom;
