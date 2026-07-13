import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

function isVoteValue(value: unknown): value is 1 | -1 {
  return value === 1 || value === -1;
}

async function scoreForAnswer(answerId: string): Promise<number> {
  const aggregate = await prisma.vote.aggregate({
    where: { answerId },
    _sum: { value: true },
  });
  return aggregate._sum.value ?? 0;
}

router.post("/vote", async (req, res, next) => {
  try {
    const { answerId, value } = req.body as {
      answerId?: unknown;
      value?: unknown;
    };

    if (typeof answerId !== "string" || !answerId.trim() || !isVoteValue(value)) {
      res.status(400).json({ error: "answerId and value (+1 or -1) are required" });
      return;
    }

    const trimmedAnswerId = answerId.trim();

    const answer = await prisma.answer.findUnique({
      where: { id: trimmedAnswerId },
    });

    if (!answer) {
      res.status(404).json({ error: "Answer not found" });
      return;
    }

    const userId = req.userId!;
    const existing = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId: trimmedAnswerId,
        },
      },
    });

    let vote: { id: string; answerId: string; userId: string; value: number } | null;

    if (!existing) {
      vote = await prisma.vote.create({
        data: {
          answerId: trimmedAnswerId,
          userId,
          value,
        },
      });
    } else if (existing.value === value) {
      await prisma.vote.delete({
        where: { id: existing.id },
      });
      vote = null;
    } else {
      vote = await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }

    const score = await scoreForAnswer(trimmedAnswerId);

    res.json({ data: { vote, score } });
  } catch (error) {
    next(error);
  }
});

router.get("/getVotes", async (req, res, next) => {
  try {
    const questionId = req.query.questionId as string | undefined;

    if (!questionId?.trim()) {
      res.status(400).json({ error: "questionId is required" });
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId.trim() },
      include: {
        answers: {
          include: {
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

    const userId = req.userId!;
    const votes = question.answers.map((answer) => {
      const score = answer.votes.reduce((sum, v) => sum + v.value, 0);
      const mine = answer.votes.find((v) => v.userId === userId);
      const myVote = mine?.value === 1 || mine?.value === -1 ? mine.value : null;

      return {
        answerId: answer.id,
        score,
        myVote,
      };
    });

    res.json({ data: { votes } });
  } catch (error) {
    next(error);
  }
});

export default router;
