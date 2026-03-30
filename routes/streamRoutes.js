import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/:filename", (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "audio",
      filename
    );

    console.log("🎧 Streaming:", filename);

    if (!fs.existsSync(filePath)) {
      console.error("❌ Archivo no existe:", filePath);
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return res.status(416).send("Range inválido");
    }

    const chunkSize = end - start + 1;

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