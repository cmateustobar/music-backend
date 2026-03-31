import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/:filename", (req, res) => {
  try {
    // 🔥 DECODIFICAR
    const rawFilename = req.params.filename;
    const filename = decodeURIComponent(rawFilename);

    if (!filename) {
      return res.status(400).json({ message: "Nombre de archivo inválido" });
    }

    // 🔥 RUTA ABSOLUTA SEGURA
    const filePath = path.resolve(
      process.cwd(),
      "uploads",
      "audio",
      filename
    );

    console.log("🎧 Streaming solicitado:");
    console.log("➡️ Filename:", filename);
    console.log("➡️ Path:", filePath);

    // ❌ NO EXISTE
    if (!fs.existsSync(filePath)) {
      console.error("❌ Archivo no encontrado:", filePath);
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // 🎧 SIN RANGE (descarga completa)
    if (!range) {
      console.log("⚡ Streaming completo");

      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 🎯 CON RANGE (stream real)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    // ❌ VALIDACIÓN RANGE
    if (start >= fileSize || end >= fileSize) {
      console.error("❌ Range inválido:", start, end);
      return res.status(416).send("Range inválido");
    }

    const chunkSize = end - start + 1;

    console.log(`🎯 Chunk: ${start}-${end} / ${fileSize}`);

    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    stream.pipe(res);

  } catch (error) {
    console.error("❌ Error en streaming:", error);
    res.status(500).json({ message: "Error en streaming" });
  }
});

export default router;