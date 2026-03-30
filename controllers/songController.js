import Song from "../models/Song.js";
import fs from "fs/promises";
import path from "path";

/* =========================
   🔧 UTILIDAD
========================= */
const cleanText = (text) => {
  if (!text) return "";
  return text.trim();
};

/* =========================
   ⬆️ SUBIR CANCIÓN
========================= */
export const uploadSong = async (req, res) => {
  try {
    const title = cleanText(req.body.title);
    const artist = cleanText(req.body.artist);

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!title) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!audioFile) {
      return res.status(400).json({ message: "Audio obligatorio" });
    }

    const newSong = new Song({
      title,
      artist: artist || "Desconocido",
      audioUrl: `/uploads/audio/${audioFile.filename}`,
      coverUrl: coverFile
        ? `/uploads/images/${coverFile.filename}`
        : "",
    });

    await newSong.save();

    console.log("✅ Canción guardada:", newSong.title);

    res.status(201).json(newSong);

  } catch (error) {
    console.error("❌ Error al subir canción:", error);
    res.status(500).json({
      message: "Error en servidor",
      error: error.message
    });
  }
};

/* =========================
   🎵 OBTENER CANCIONES (BLINDADO)
========================= */
export const getSongs = async (req, res) => {
  try {
    console.log("📡 GET /api/songs");

    const songs = await Song.find({}).lean();

    res.status(200).json(songs);

  } catch (error) {
    console.error("❌ Error en getSongs:", error);

    res.status(500).json({
      message: "Error al obtener canciones",
      error: error.message
    });
  }
};

/* =========================
   🗑 ELIMINAR CANCIÓN
========================= */
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    const deleteFile = async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch {
        console.warn("⚠️ Archivo no encontrado:", filePath);
      }
    };

    if (song.audioUrl) {
      const audioPath = path.join(
        process.cwd(),
        "uploads",
        "audio",
        path.basename(song.audioUrl)
      );
      await deleteFile(audioPath);
    }

    if (song.coverUrl) {
      const coverPath = path.join(
        process.cwd(),
        "uploads",
        "images",
        path.basename(song.coverUrl)
      );
      await deleteFile(coverPath);
    }

    await Song.findByIdAndDelete(id);

    res.json({ message: "Canción eliminada" });

  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    res.status(500).json({ message: "Error al eliminar canción" });
  }
};