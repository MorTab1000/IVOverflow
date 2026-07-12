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

router.post("/createQuestion", async (req, res) => {
  const { title, body, tags } = req.body as {
    title?: string;
    body?: string;
    tags?: string[];
  };

  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ error: "Title and body are required" });
    return;
  }

  const question = await prisma.question.create({
    data: {
      userId: req.userId!,
      title: title.trim(),
      body: body.trim(),
      tags: tags ?? [],
    },
    include: {
      user: { select: authorSelect },
    },
  });

  res.status(201).json({ data: { question } });
});

router.get("/getQuestions", async (_req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: authorSelect },
    },
  });

  res.json({ data: { questions } });
});

router.get("/getQuestionAnswer", async (req, res) => {
  const questionId = req.query.questionId as string | undefined;

  if (!questionId) {
    res.status(400).json({ error: "questionId is required" });
    return;
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      user: { select: authorSelect },
      answers: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: authorSelect },
        },
      },
    },
  });

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const { answers, ...questionData } = question;

  res.json({
    data: {
      question: questionData,
      answers,
    },
  });
});

export default router;
