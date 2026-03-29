import express from "express";
import { streamAudio } from "../controllers/streamController.js";

const router = express.Router();

// 🎧 STREAM
router.get("/:filename", streamAudio);

export default router;