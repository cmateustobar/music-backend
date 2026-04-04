import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    console.log("📥 REGISTER:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const exists = await User.findOne({ email });
    console.log("🔍 Exists:", exists);

    if (exists) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
    });

    console.log("✅ Usuario guardado:", user);

    res.json({ message: "Usuario creado correctamente" });

  } catch (error) {
    console.error("💥 ERROR REGISTER:", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("📥 LOGIN:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("🔍 Usuario:", user);

    if (!user) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    console.error("💥 ERROR LOGIN:", error);
    res.status(500).json({ error: error.message });
  }
};