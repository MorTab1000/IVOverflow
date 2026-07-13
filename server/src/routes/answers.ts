import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const authorSelect = {
  id: true,
  nickname: true,
  fullName: true,
} as const;

router.use(authMiddleware);

router.post("/answer", async (req, res) => {
  const { questionId, body } = req.body as {
    questionId?: string;
    body?: string;
  };

  if (!questionId?.trim() || !body?.trim()) {
    res.status(400).json({ error: "questionId and body are required" });
    return;
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId.trim() },
  });

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const answer = await prisma.answer.create({
    data: {
      questionId: questionId.trim(),
      userId: req.userId!,
      body: body.trim(),
    },
    include: {
      user: { select: authorSelect },
    },
  });

  res.status(201).json({ data: { answer } });
});

export default router;
