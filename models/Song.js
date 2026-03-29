import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: String,
    artist: String,
    audioUrl: String,
    coverUrl: String,
  },
  { timestamps: true } // 🔥 CLAVE
);

export default mongoose.model("Song", songSchema);