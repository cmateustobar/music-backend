import express from "express";
import { register, login, testAuth } from "../controllers/authController.js";

const router = express.Router();

// Ruta test
router.get("/test", testAuth);

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

export default router;