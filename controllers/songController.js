import Song from "../models/Song.js";
import fs from "fs";
import path from "path";

/* =========================
   🎵 SUBIR CANCIÓN
========================= */
export const uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;

    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!audioFile) {
      return res.status(400).json({ msg: "Audio requerido" });
    }

    const newSong = new Song({
      title,
      artist,
      audioUrl: `/uploads/audio/${audioFile.filename}`,
      coverUrl: coverFile
        ? `/uploads/images/${coverFile.filename}`
        : "",
    });

    await newSong.save();

    res.json(newSong);

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ msg: "Error subiendo canción" });
  }
};

/* =========================
   📄 OBTENER
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
   ❌ ELIMINAR
========================= */
export const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ msg: "No encontrada" });

    const audioPath = path.join(process.cwd(), song.audioUrl);
    const coverPath = path.join(process.cwd(), song.coverUrl);

    console.log("🗑 Eliminando:", audioPath);

    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);

    await Song.findByIdAndDelete(id);

    res.json({ msg: "Eliminada correctamente" });

  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ msg: "Error eliminando" });
  }
};

/* =========================
   🎧 STREAM (FIX CRÍTICO)
========================= */
export const streamSong = (req, res) => {
  const { filename } = req.params;

  // 🔥 RUTA ABSOLUTA (CLAVE)
  const filePath = path.join(process.cwd(), "uploads/audio", filename);

  console.log("🎧 Buscando archivo:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Archivo NO encontrado:", filePath);
    return res.status(404).json({ message: "Archivo no encontrado" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunkSize = end - start + 1;

    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    file.pipe(res);

  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath).pipe(res);
  }
};