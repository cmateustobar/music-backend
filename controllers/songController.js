import Song from "../models/Song.js";
import fs from "fs/promises";
import path from "path";

// 🔥 UTILIDAD: limpiar texto
const cleanText = (text) => {
  if (!text) return "";
  return text.trim();
};

// 🔥 SUBIR CANCIÓN
export const uploadSong = async (req, res) => {
  try {
    const title = cleanText(req.body.title);
    const artist = cleanText(req.body.artist);

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    // 🚫 VALIDACIONES
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

    res.status(201).json(newSong);

  } catch (error) {
    console.error("❌ Error al subir canción:", error);
    res.status(500).json({ message: "Error en servidor" });
  }
};

// 🔥 OBTENER CANCIONES
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .sort({ createdAt: -1 }) // requiere timestamps
      .lean();

    res.status(200).json(songs);

  } catch (error) {
    console.error("❌ Error al obtener canciones:", error);
    res.status(500).json({ message: "Error al obtener canciones" });
  }
};

// 🔥 ELIMINAR CANCIÓN
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    // 🔥 ELIMINAR ARCHIVOS (NO BLOQUEANTE)
    const deleteFile = async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn("⚠️ Archivo no encontrado o ya eliminado:", filePath);
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

    // 🔥 ELIMINAR DE DB
    await Song.findByIdAndDelete(id);

    res.json({ message: "Canción eliminada completamente" });

  } catch (error) {
    console.error("❌ Error al eliminar canción:", error);
    res.status(500).json({ message: "Error al eliminar canción" });
  }
};