import fs from "fs";
import path from "path";

export const streamAudio = (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.resolve("uploads/audio", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // 🔥 MIME FORZADO (CLAVE TOTAL)
    const contentType = "audio/mpeg";

    // 🔥 SIN RANGE (CELULARES)
    if (!range) {
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": fileSize,
        "Accept-Ranges": "bytes",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // 🔥 CON RANGE (STREAMING)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);

  } catch (error) {
    console.error("❌ Error streaming:", error);
    res.status(500).json({ message: "Error en streaming" });
  }
};