import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";

dotenv.config();

const app = express();

// =============================
// MIDDLEWARES
// =============================
app.use(cors());
app.use(express.json());

// =============================
// ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// =============================
// HEALTH CHECK
// =============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API funcionando 🚀",
    time: new Date(),
  });
});

// =============================
// ERROR HANDLER (IMPORTANTE)
// =============================
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err);
  res.status(500).json({ msg: "Error interno del servidor" });
});

// =============================
// DB CONNECTION
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado ✅"))
  .catch((err) => {
    console.error("Error MongoDB:", err);
    process.exit(1); // 🔥 importante en producción
  });

// =============================
// SERVER
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});