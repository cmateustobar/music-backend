import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =========================
// 🧪 TEST
// =========================
export const testAuth = (req, res) => {
  res.json({ msg: "Auth funcionando 🚀" });
};

// =========================
// 📝 REGISTER
// =========================
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validar
    if (!email || !password) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    // verificar si existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "Usuario ya existe" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ msg: "Usuario creado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en registro" });
  }
};

// =========================
// 🔐 LOGIN (ESTO FALTABA)
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validar
    if (!email || !password) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Usuario no existe" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en login" });
  }
};