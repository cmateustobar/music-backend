import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// conexión a MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/musicapp")
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.log("❌ Error:", err));

// ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// levantar servidor
app.listen(5000, () => {
  console.log("🚀 Servidor en puerto 5000");
});