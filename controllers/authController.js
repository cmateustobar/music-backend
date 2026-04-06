import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// =========================
// 📤 SUBIR CANCIÓN
// =========================
export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({
        error: "Faltan archivos",
      });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    console.log("🎵 Subiendo a Cloudinary...");

    // subir audio
    const audioUpload = await cloudinary.uploader.upload(
      audioFile.path,
      {
        resource_type: "video",
        folder: "music/audio",
      }
    );

    // subir imagen
    const imageUpload = await cloudinary.uploader.upload(
      imageFile.path,
      {
        resource_type: "image",
        folder: "music/images",
      }
    );

    // eliminar archivos locales
    fs.unlinkSync(audioFile.path);
    fs.unlinkSync(imageFile.path);

    // guardar en DB
    const newSong = new Song({
      title,
      artist,
      audioUrl: audioUpload.secure_url,
      coverUrl: imageUpload.secure_url,
    });

    await newSong.save();

    console.log("✅ Canción guardada");

    res.status(201).json(newSong);

  } catch (error) {
    console.error("❌ Error upload:", error);
    res.status(500).json({ error: "Error al subir canción" });
  }
};

// =========================
// 📥 OBTENER CANCIONES
// =========================
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener canciones" });
  }
};

// =========================
// 🗑️ ELIMINAR
// =========================
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    await Song.findByIdAndDelete(id);

    res.json({ message: "Canción eliminada" });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar canción" });
  }
};