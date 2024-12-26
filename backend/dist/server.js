"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/api/create-room", (req, res) => {
    const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    res.json({ roomId });
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Adjust this to your frontend's origin
        methods: ["GET", "POST"],
    },
});
const usersInRoom = {};
const socketRoomMap = {};
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
        var _a, _b;
        console.log("A user disconnected");
        const roomId = socketRoomMap[socket.id];
        delete socketRoomMap[socket.id];
        const usernameIndex = (_a = usersInRoom[roomId]) === null || _a === void 0 ? void 0 : _a.findIndex((user) => user.socketId === socket.id);
        if (usernameIndex !== -1) {
            (_b = usersInRoom[roomId]) === null || _b === void 0 ? void 0 : _b.splice(usernameIndex, 1);
            io.to(roomId).emit("userList", usersInRoom[roomId]);
        }
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
