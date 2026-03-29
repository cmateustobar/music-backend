import multer from "multer";
import path from "path";

// 🔥 SANITIZAR NOMBRE (CLAVE PARA STREAMING)
const cleanFileName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "");
};

// 📦 STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "audio") {
      cb(null, "uploads/audio");
    } else if (file.fieldname === "cover") {
      cb(null, "uploads/images");
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = cleanFileName(path.basename(file.originalname, ext));

    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

// 🛡 FILTRO
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audio") {
    if (file.mimetype.startsWith("audio/")) {
      return cb(null, true);
    }
    return cb(new Error("Solo se permiten audios"));
  }

  if (file.fieldname === "cover") {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Solo se permiten imágenes"));
  }

  return cb(new Error("Campo no válido"));
};

// 🚀 EXPORT
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

export default upload;