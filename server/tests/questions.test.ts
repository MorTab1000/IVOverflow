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

describe("Question endpoints auth", () => {
  it("returns 401 for GET /getQuestions without JWT", async () => {
    const res = await request(app).get("/getQuestions");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 for POST /createQuestion without JWT", async () => {
    const res = await request(app).post("/createQuestion").send({
      title: "Test",
      body: "Body",
      tags: [],
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});

describe("POST /createQuestion", () => {
  it("returns 400 when title or body is missing", async () => {
    const res = await request(app)
      .post("/createQuestion")
      .set(authHeader)
      .send({ title: "  ", body: "valid body" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title and body are required" });
    expect(mockedPrisma.question.create).not.toHaveBeenCalled();
  });

  it("returns 201 and creates a question with tags", async () => {
    mockedPrisma.question.create.mockResolvedValue(sampleQuestion);

    const res = await request(app)
      .post("/createQuestion")
      .set(authHeader)
      .send({
        title: "How do I fix this?",
        body: "Getting a TypeScript error...",
        tags: ["typescript", "prisma"],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.question).toMatchObject({
      id: "question-1",
      title: "How do I fix this?",
      body: "Getting a TypeScript error...",
      tags: ["typescript", "prisma"],
      user: author,
    });
    expect(mockedPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: "user-1",
          title: "How do I fix this?",
          body: "Getting a TypeScript error...",
          tags: ["typescript", "prisma"],
        },
      }),
    );
  });

  it("defaults tags to an empty array when omitted", async () => {
    mockedPrisma.question.create.mockResolvedValue({
      ...sampleQuestion,
      tags: [],
    });

    const res = await request(app).post("/createQuestion").set(authHeader).send({
      title: "No tags",
      body: "Body only",
    });

    expect(res.status).toBe(201);
    expect(mockedPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tags: [] }),
      }),
    );
  });
});

describe("GET /getQuestions", () => {
  it("returns 200 with questions list including author", async () => {
    mockedPrisma.question.findMany.mockResolvedValue([sampleQuestion]);

    const res = await request(app).get("/getQuestions").set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(1);
    expect(res.body.data.questions[0]).toMatchObject({
      id: "question-1",
      title: "How do I fix this?",
      tags: ["typescript", "prisma"],
      user: author,
    });
    expect(mockedPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});

describe("GET /getQuestionAnswer", () => {
  it("returns 400 when questionId is missing", async () => {
    const res = await request(app).get("/getQuestionAnswer").set(authHeader);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "questionId is required" });
  });

  it("returns 404 when question does not exist", async () => {
    mockedPrisma.question.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/getQuestionAnswer")
      .query({ questionId: "missing-id" })
      .set(authHeader);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Question not found" });
  });

  it("returns 200 with question and empty answers for Stage 1", async () => {
    const questionWithAnswers = {
      ...sampleQuestion,
      answers: [],
    };
    mockedPrisma.question.findUnique.mockResolvedValue(questionWithAnswers);

    const res = await request(app)
      .get("/getQuestionAnswer")
      .query({ questionId: "question-1" })
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.question).toMatchObject({
      id: "question-1",
      title: "How do I fix this?",
      user: author,
    });
    expect(res.body.data.answers).toEqual([]);
  });
});
