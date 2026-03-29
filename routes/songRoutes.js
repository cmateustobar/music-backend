import express from "express";
import upload from "../middlewares/upload.js";
import {
  uploadSong,
  getSongs,
  deleteSong,
} from "../controllers/songController.js";

const router = express.Router();

// 🔴 SUBIR
router.post(
  "/upload",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  uploadSong
);

// 🟢 OBTENER
router.get("/", getSongs);

// 🔥 ELIMINAR (CLAVE)
router.delete("/:id", deleteSong);

export default router;