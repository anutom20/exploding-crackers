import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function JoinRoom() {
  const { roomId } = useParams();
  const [username, setUsername] = useState("");
  const socket = io(import.meta.env.VITE_BACKEND_BASE_URL);

  const [players, setPlayers] = useState<
    { username: string; socketId: string }[]
  >([]);

  useEffect(() => {
    socket.on("userList", (users) => {
      setPlayers(users);
    });
  }, [socket]);

  const joinRoom = () => {
    socket.emit("joinRoom", { roomId, username });
  };

  return (
    <div>
      <h1>Join Room: {roomId}</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <div id="messages">
        {players.map((player, index) => (
          <p key={index}>{player.username}</p>
        ))}
      </div>
    </div>
  );
}

export default JoinRoom;
