import express from "express";
import {
  uploadSong,
  getSongs,
  deleteSong,
} from "../controllers/songController.js";

import upload from "../middleware/upload.js";
// ❌ IMPORTANTE: NO usar authMiddleware aquí

const router = express.Router();

// 🔓 PÚBLICO (para tu app actual)
router.get("/", getSongs);
router.post("/upload", upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 },
]), uploadSong);

// eliminar también público
router.delete("/:id", deleteSong);

export default router;