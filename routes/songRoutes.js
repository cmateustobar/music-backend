import express from "express";
import {
  deleteSong,
  getSongs,
  importSongFromUrl,
  importSongsFromUrls,
  uploadBulkSongs,
  uploadSong,
} from "../controllers/songController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getSongs);

router.post(
  "/upload",
  protect,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  uploadSong
);

router.post(
  "/upload/bulk",
  protect,
  upload.fields([
    { name: "audios", maxCount: 50 },
    { name: "image", maxCount: 1 },
  ]),
  uploadBulkSongs
);

router.post("/import-url", protect, importSongFromUrl);
router.post("/import-urls", protect, importSongsFromUrls);

router.delete("/:id", protect, deleteSong);

export default router;
