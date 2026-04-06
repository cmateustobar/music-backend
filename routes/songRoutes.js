import express from "express";
import {
  uploadSong,
  getSongs,
  deleteSong,
} from "../controllers/songController.js";

import upload from "../middlewares/upload.js"; // ✅ CORREGIDO (middlewares)

const router = express.Router();

// =========================
// 🎵 OBTENER CANCIONES
// =========================
router.get("/", getSongs);

// =========================
// 📤 SUBIR CANCIÓN
// =========================
router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  uploadSong
);

// =========================
// 🗑️ ELIMINAR CANCIÓN
// =========================
router.delete("/:id", deleteSong);

export default router;