import { useState } from "react";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");

  const createRoom = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_BASE_URL}/api/create-room`,
      {
        method: "POST",
      }
    );
    const data = await response.json();
    setRoomId(data.roomId);
  };

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      {roomId && (
        <div>
          <p>Share this link to join the room:</p>
          <a href={`/join/${roomId}`}>
            {window.location.origin}/join/{roomId}
          </a>
        </div>
      )}
    </div>
  );
}

export default CreateRoom;
