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
        include: {
          user: { select: authorSelect },
          votes: {
            select: {
              value: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const { answers: rawAnswers, ...questionData } = question;
  const userId = req.userId!;

  const answers = rawAnswers
    .map(({ votes, ...answer }) => {
      const score = votes.reduce((sum, v) => sum + v.value, 0);
      const mine = votes.find((v) => v.userId === userId);
      const myVote = mine?.value === 1 || mine?.value === -1 ? mine.value : null;

      return {
        ...answer,
        score,
        myVote,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  res.json({
    data: {
      question: questionData,
      answers,
    },
  });
});

export default router;
