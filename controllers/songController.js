import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js";

/* =========================
   🎵 SUBIR CANCIÓN
========================= */
export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({ msg: "Faltan archivos" });
    }

    const audioUpload = await cloudinary.uploader.upload(
      req.files.audio[0].path,
      {
        resource_type: "video",
        folder: "music/audio",
      }
    );

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
    res.status(500).json({ msg: "Error subiendo canción" });
  }
};

/* =========================
   📃 OBTENER
========================= */
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ msg: "Error obteniendo canciones" });
  }
};

/* =========================
   ❌ ELIMINAR (PRO)
========================= */
const extractPublicId = (url, folder) => {
  const parts = url.split("/");
  const file = parts[parts.length - 1];
  const publicId = file.split(".")[0];
  return `${folder}/${publicId}`;
};

export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ msg: "No encontrada" });

    // 🔥 eliminar en Cloudinary
    if (song.audioUrl) {
      const audioId = extractPublicId(song.audioUrl, "music/audio");
      await cloudinary.uploader.destroy(audioId, {
        resource_type: "video",
      });
    }

    if (song.coverUrl) {
      const imageId = extractPublicId(song.coverUrl, "music/images");
      await cloudinary.uploader.destroy(imageId);
    }

    await Song.findByIdAndDelete(id);

    res.json({ msg: "Canción eliminada correctamente" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ msg: "Error eliminando canción" });
  }
};