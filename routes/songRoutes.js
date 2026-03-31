import express from "express";
import multer from "multer";
import {
  uploadSong,
  getSongs,
  deleteSong,
} from "../controllers/songController.js";

const router = express.Router();

/**
 * 🔥 Multer SOLO como parser (NO almacenamiento permanente)
 */
const upload = multer({
  dest: "temp/", // carpeta temporal (Render la borra automáticamente)
});

/* =========================
   🎵 SUBIR CANCIÓN
========================= */
router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 }, // ⚠️ IMPORTANTE: debe coincidir con controller
  ]),
  uploadSong
);

/* =========================
   📄 OBTENER
========================= */
router.get("/", getSongs);

/* =========================
   ❌ ELIMINAR
========================= */
router.delete("/:id", deleteSong);

export default router;