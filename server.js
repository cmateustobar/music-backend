import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import songRoutes from "./routes/songRoutes.js";

dotenv.config(); // 🔥 OBLIGATORIO

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 DEBUG
console.log("MONGO_URI:", process.env.MONGO_URI);

// 🔥 CONEXIÓN MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Error Mongo:", err));

app.use("/api/songs", songRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});