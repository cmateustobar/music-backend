import Song from "../models/Song.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!req.files?.audio || !req.files?.image) {
      return res.status(400).json({ msg: "Faltan archivos" });
    }

    console.log("🔥 SUBIENDO A CLOUDINARY...");

    // 🎵 AUDIO
    const audioUpload = await cloudinary.uploader.upload(
      req.files.audio[0].path,
      {
        resource_type: "video"
      }
    );

    // 🖼️ IMAGEN
    const imageUpload = await cloudinary.uploader.upload(
      req.files.image[0].path
    );

    console.log("✅ Cloudinary OK");

    const newSong = new Song({
      title,
      artist,
      audioUrl: audioUpload.secure_url,
      coverUrl: imageUpload.secure_url
    });

    await newSong.save();

    // 🧹 eliminar archivos locales
    fs.unlinkSync(req.files.audio[0].path);
    fs.unlinkSync(req.files.image[0].path);

    res.status(201).json(newSong);

  } catch (error) {
    console.error("❌ ERROR SUBIENDO:", error);
    res.status(500).json({
      msg: "Error subiendo canción",
      error: error.message
    });
  }
};