import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/api/create-room", (req: Request, res: Response) => {
  const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
  res.json({ roomId });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this to your frontend's origin
    methods: ["GET", "POST"],
  },
});

const usersInRoom: { [key: string]: { username: string; socketId: string }[] } =
  {};

const socketRoomMap: { [key: string]: string } = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomData) => {
    socket.join(roomData.roomId);
    socketRoomMap[socket.id] = roomData.roomId;
    console.log(`User ${roomData.username} joined room: ${roomData.roomId}`);

    if (!usersInRoom[roomData.roomId]) {
      usersInRoom[roomData.roomId] = [];
    }
    usersInRoom[roomData.roomId].push({
      username: roomData.username,
      socketId: socket.id,
    });

    console.log(socket.rooms);

    io.to(roomData.roomId).emit("userList", usersInRoom[roomData.roomId]);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    const roomId = socketRoomMap[socket.id];
    delete socketRoomMap[socket.id];
    const usernameIndex = usersInRoom[roomId]?.findIndex(
      (user) => user.socketId === socket.id
    );
    if (usernameIndex !== -1) {
      usersInRoom[roomId]?.splice(usernameIndex, 1);
      io.to(roomId).emit("userList", usersInRoom[roomId]);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
