import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import Song from "../models/Song.js";

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getTitleFromFileName = (fileName = "") => {
  const parsedName = path.parse(fileName).name;
  return parsedName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
};

const isPublicHttpUrl = (value = "") => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const uploadSong = async (req, res) => {
  let audioFile;
  let imageFile;

  try {
    const { title, artist } = req.body;

    audioFile = req.files?.audio?.[0];
    imageFile = req.files?.image?.[0];

    if (!audioFile || !imageFile) {
      return res.status(400).json({ message: "Faltan archivos" });
    }

    if (!audioFile.mimetype.startsWith("audio/")) {
      return res.status(400).json({ message: "Archivo de audio invalido" });
    }

    if (!imageFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Imagen invalida" });
    }

    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
      folder: "songs/audio",
    });

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "songs/images",
    });

    const newSong = await Song.create({
      title,
      artist,
      audioUrl: audioUpload.secure_url,
      coverUrl: imageUpload.secure_url,
    });

    res.status(201).json(newSong);
  } catch (err) {
    console.error("ERROR uploadSong:", err);
    res.status(500).json({ message: "Error subiendo cancion" });
  } finally {
    cleanupFile(audioFile?.path);
    cleanupFile(imageFile?.path);
  }
};

export const uploadBulkSongs = async (req, res) => {
  const audioFiles = req.files?.audios || [];
  const imageFile = req.files?.image?.[0];

  try {
    const { artist = "Artista desconocido", album = "" } = req.body;

    if (!audioFiles.length || !imageFile) {
      return res.status(400).json({
        message: "Selecciona al menos un audio y una portada compartida",
      });
    }

    if (!imageFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Imagen invalida" });
    }

    const invalidAudio = audioFiles.find(
      (file) => !file.mimetype.startsWith("audio/")
    );

    if (invalidAudio) {
      return res.status(400).json({
        message: `Archivo de audio invalido: ${invalidAudio.originalname}`,
      });
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      folder: "songs/images",
    });

    const createdSongs = [];

    for (const audioFile of audioFiles) {
      const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
        folder: "songs/audio",
      });

      const title = getTitleFromFileName(audioFile.originalname);

      const song = await Song.create({
        title: title || "Cancion sin titulo",
        artist: artist.trim() || "Artista desconocido",
        album: album.trim(),
        audioUrl: audioUpload.secure_url,
        coverUrl: imageUpload.secure_url,
      });

      createdSongs.push(song);
    }

    res.status(201).json({
      message: "Carga masiva completada",
      count: createdSongs.length,
      songs: createdSongs,
    });
  } catch (err) {
    console.error("ERROR uploadBulkSongs:", err);
    res.status(500).json({ message: "Error subiendo canciones en lote" });
  } finally {
    cleanupFile(imageFile?.path);
    audioFiles.forEach((file) => cleanupFile(file.path));
  }
};

export const importSongFromUrl = async (req, res) => {
  try {
    const { title, artist, album = "", audioUrl, coverUrl } = req.body;

    if (!title?.trim() || !artist?.trim() || !audioUrl?.trim() || !coverUrl?.trim()) {
      return res.status(400).json({
        message: "Titulo, artista, audioUrl y coverUrl son obligatorios",
      });
    }

    if (!isPublicHttpUrl(audioUrl) || !isPublicHttpUrl(coverUrl)) {
      return res.status(400).json({
        message: "Las URLs deben ser publicas y empezar por http o https",
      });
    }

    const song = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      audioUrl: audioUrl.trim(),
      coverUrl: coverUrl.trim(),
    });

    res.status(201).json(song);
  } catch (err) {
    console.error("ERROR importSongFromUrl:", err);
    res.status(500).json({ message: "Error importando cancion desde URL" });
  }
};

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error("ERROR getSongs:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "No encontrada" });
    }

    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: "Eliminada" });
  } catch (err) {
    console.error("ERROR deleteSong:", err);
    res.status(500).json({ message: err.message });
  }
};
