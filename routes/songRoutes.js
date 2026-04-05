import express from "express";
import {
  uploadSong,
  getSongs,
  deleteSong
} from "../controllers/songController.js";

// ✅ RUTAS CORRECTAS (middlewares en plural)
import upload from "../middlewares/upload.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// =========================
// 🔐 SUBIR CANCIÓN (PROTEGIDO)
// =========================
router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  uploadSong
);

// =========================
// 🗑️ ELIMINAR (PROTEGIDO)
// =========================
router.delete("/:id", protect, deleteSong);

// =========================
// 🎧 OBTENER CANCIONES (PÚBLICO)
// =========================
router.get("/", getSongs);

export default router;