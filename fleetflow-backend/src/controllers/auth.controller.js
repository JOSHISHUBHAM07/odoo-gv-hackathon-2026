import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Normalize email to lowercase to ensure a match with seed data
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // 2. Validate user existence and decrypt password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // 3. Generate JWT using the secret from your .env
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // 4. Return the complete payload required by the frontend AppLayout
    // Including 'name' satisfies the Identity Persistence requirement.
    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    console.error("Login Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
