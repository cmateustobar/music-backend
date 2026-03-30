import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/:filename", (req, res) => {
  const filePath = path.join(process.cwd(), "uploads/audio", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Archivo no encontrado");
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

    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mpeg",
    });

    stream.pipe(res);

  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;