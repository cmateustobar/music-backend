import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js";

/**
 * 🎵 SUBIR CANCIÓN
 */
export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({ msg: "Faltan archivos" });
    }

    console.log("🔥 SUBIENDO A CLOUDINARY...");

    // 📌 Subir audio
    const audioUpload = await cloudinary.uploader.upload(
      req.files.audio[0].path,
      {
        resource_type: "video", // IMPORTANTE para audio
        folder: "music/audio",
      }
    );

    // 📌 Subir imagen
    const imageUpload = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: "music/images",
      }
    );

    const newSong = new Song({
      title,
      artist,
      audioUrl: audioUpload.secure_url,
      coverUrl: imageUpload.secure_url,
    });

    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    console.error("❌ Error subiendo canción:", error);
    res.status(500).json({ msg: "Error subiendo canción", error: error.message });
  }
};

/**
 * 📃 OBTENER CANCIONES
 */
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error("❌ Error obteniendo canciones:", error);
    res.status(500).json({ msg: "Error obteniendo canciones" });
  }
};

/**
 * ❌ ELIMINAR CANCIÓN
 */
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    await Song.findByIdAndDelete(id);

    res.json({ msg: "Canción eliminada correctamente" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({
      msg: "Error eliminando canción",
      error: error.message,
    });
  }
};