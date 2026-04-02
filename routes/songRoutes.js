import express from "express";
import multer from "multer";
import {
  uploadSong,
  getSongs,
  deleteSong,
} from "../controllers/songController.js";

const router = express.Router();

/* =========================
   🔥 FIX CORS A NIVEL RUTA
========================= */
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/**
 * 🔥 Multer SOLO como parser
 */
const upload = multer({
  dest: "temp/",
});

/* =========================
   🎵 SUBIR CANCIÓN
========================= */
router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
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