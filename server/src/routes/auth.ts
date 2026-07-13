import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { signToken } from "../utils/jwt";
import { verifyPassword } from "../utils/password";

const router = Router();

const userSelect = {
  id: true,
  nickname: true,
  fullName: true,
  email: true,
} as const;

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...userSelect,
      passwordHash: true,
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    data: {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        fullName: user.fullName,
        email: user.email,
      },
    },
  });
});

router.get("/userInfo", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: userSelect,
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ data: user });
});

export default router;
