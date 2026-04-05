import express from "express";
import {
  uploadSong,
  getSongs,
  deleteSong
} from "../controllers/songController.js";

import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 PROTEGIDAS
router.post("/upload", protect, upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 }
]));

router.post("/upload", protect, uploadSong);

router.delete("/:id", protect, deleteSong);

// 🌐 PÚBLICA
router.get("/", getSongs);

export default router;