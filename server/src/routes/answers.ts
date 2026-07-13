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

router.post("/answer", async (req, res, next) => {
  try {
    const { questionId, body } = req.body as {
      questionId?: unknown;
      body?: unknown;
    };

    if (typeof questionId !== "string" || typeof body !== "string") {
      res.status(400).json({ error: "questionId and body are required" });
      return;
    }

    if (!questionId.trim() || !body.trim()) {
      res.status(400).json({ error: "questionId and body are required" });
      return;
    }

    const trimmedQuestionId = questionId.trim();
    const trimmedBody = body.trim();

    const question = await prisma.question.findUnique({
      where: { id: trimmedQuestionId },
    });

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const answer = await prisma.answer.create({
      data: {
        questionId: trimmedQuestionId,
        userId: req.userId!,
        body: trimmedBody,
      },
      include: {
        user: { select: authorSelect },
      },
    });

    res.status(201).json({ data: { answer } });
  } catch (error) {
    next(error);
  }
});

export default router;
