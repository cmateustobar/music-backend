import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ msg: "Auth funcionando 🚀" });
});

router.post("/register", register);
router.post("/login", login);

export default router;