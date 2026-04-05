import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js"; // ✅ CORRECTO
import fs from "fs";

// =========================
// 🎵 SUBIR CANCIÓN (SEGURO)
// =========================
export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    if (!audioFile || !imageFile) {
      return res.status(400).json({ message: "Faltan archivos" });
    }

    // 🔐 VALIDACIONES
    if (!audioFile.mimetype.startsWith("audio/")) {
      return res.status(400).json({ message: "Archivo de audio inválido" });
    }

    if (!imageFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Imagen inválida" });
    }

    // ☁️ SUBIR A CLOUDINARY
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "songs/audio",
    });

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "songs/images",
    });

    // 🗄️ GUARDAR EN DB
    const newSong = await Song.create({
      title,
      artist,
      audioUrl: audioUpload.secure_url,
      coverUrl: imageUpload.secure_url,
    });

    // 🧹 LIMPIEZA SEGURA
    if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
    if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);

    res.status(201).json(newSong);

  } catch (err) {
    console.error("❌ ERROR uploadSong:", err);
    res.status(500).json({ message: "Error subiendo canción" });
  }
};

// =========================
// 🎧 OBTENER CANCIONES
// =========================
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error("❌ ERROR getSongs:", err);
    res.status(500).json({ message: err.message });
  }
};

// =========================
// ❌ ELIMINAR
// =========================
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "No encontrada" });
    }

    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: "Eliminada" });

  } catch (err) {
    console.error("❌ ERROR deleteSong:", err);
    res.status(500).json({ message: err.message });
  }
};