import express from "express";
import { createRoom } from "../controllers/createRoom";
const router = express.Router();

router.post("/create-room", createRoom);

export default router;
