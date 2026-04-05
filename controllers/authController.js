import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =============================
// TEST
// =============================
export const testAuth = (req, res) => {
  res.json({ msg: "Auth funcionando 🚀" });
};

// =============================
// REGISTER
// =============================
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ msg: "Email y password son obligatorios" });
    }

    // Verificar si ya existe
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error REGISTER:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// =============================
// LOGIN
// =============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({ msg: "Email y password son obligatorios" });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    // Crear token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secreto123",
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error LOGIN:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};