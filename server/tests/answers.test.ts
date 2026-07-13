import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import { signToken } from "../src/utils/jwt";

const mockedPrisma = vi.mocked(prisma, true);

const token = signToken({ userId: "user-1", email: "alice@ivtech.dev" });
const authHeader = { Authorization: `Bearer ${token}` };

const author = {
  id: "user-1",
  nickname: "dev_alice",
  fullName: "Alice Cohen",
};

const sampleQuestion = {
  id: "question-1",
  userId: "user-1",
  title: "How do I fix this?",
  body: "Getting a TypeScript error...",
  tags: ["typescript", "prisma"],
  createdAt: new Date("2026-07-12T12:00:00.000Z"),
  user: author,
};

const sampleAnswer = {
  id: "answer-1",
  questionId: "question-1",
  userId: "user-1",
  body: "Try running prisma generate.",
  createdAt: new Date("2026-07-13T12:00:00.000Z"),
  user: author,
};

describe("POST /answer auth", () => {
  it("returns 401 without JWT", async () => {
    const res = await request(app).post("/answer").send({
      questionId: "question-1",
      body: "Try running prisma generate.",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockedPrisma.answer.create).not.toHaveBeenCalled();
  });
});

describe("POST /answer", () => {
  it("returns 400 when questionId or body is missing", async () => {
    const res = await request(app)
      .post("/answer")
      .set(authHeader)
      .send({ questionId: "question-1", body: "  " });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "questionId and body are required" });
    expect(mockedPrisma.answer.create).not.toHaveBeenCalled();
  });

  it("returns 404 when question does not exist", async () => {
    mockedPrisma.question.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/answer").set(authHeader).send({
      questionId: "missing-id",
      body: "Try running prisma generate.",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Question not found" });
    expect(mockedPrisma.answer.create).not.toHaveBeenCalled();
  });

  it("returns 201 and creates an answer with author", async () => {
    mockedPrisma.question.findUnique.mockResolvedValue(sampleQuestion);
    mockedPrisma.answer.create.mockResolvedValue(sampleAnswer);

    const res = await request(app).post("/answer").set(authHeader).send({
      questionId: "question-1",
      body: "Try running prisma generate.",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.answer).toMatchObject({
      id: "answer-1",
      questionId: "question-1",
      userId: "user-1",
      body: "Try running prisma generate.",
      user: author,
    });
    expect(mockedPrisma.question.findUnique).toHaveBeenCalledWith({
      where: { id: "question-1" },
    });
    expect(mockedPrisma.answer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          questionId: "question-1",
          userId: "user-1",
          body: "Try running prisma generate.",
        },
      }),
    );
  });
});
