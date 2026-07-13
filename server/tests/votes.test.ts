import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import { signToken } from "../src/utils/jwt";

const mockedPrisma = vi.mocked(prisma, true);

const token = signToken({ userId: "user-1", email: "alice@ivtech.dev" });
const authHeader = { Authorization: `Bearer ${token}` };

const sampleAnswer = {
  id: "answer-1",
  questionId: "question-1",
  userId: "user-2",
  body: "Try running prisma generate.",
  createdAt: new Date("2026-07-13T12:00:00.000Z"),
};

const upvote = {
  id: "vote-1",
  answerId: "answer-1",
  userId: "user-1",
  value: 1,
};

const downvote = {
  id: "vote-1",
  answerId: "answer-1",
  userId: "user-1",
  value: -1,
};

function mockVoteAggregate(sum: number | null) {
  return {
    _sum: { value: sum },
    _avg: { value: null },
    _min: { id: null, answerId: null, userId: null, value: null },
    _max: { id: null, answerId: null, userId: null, value: null },
    _count: { _all: 0, id: 0, answerId: 0, userId: 0, value: 0 },
  };
}

describe("POST /vote auth", () => {
  it("returns 401 without JWT", async () => {
    const res = await request(app).post("/vote").send({
      answerId: "answer-1",
      value: 1,
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockedPrisma.vote.create).not.toHaveBeenCalled();
  });
});

describe("POST /vote validation", () => {
  it("returns 400 when answerId or value is invalid", async () => {
    const res = await request(app)
      .post("/vote")
      .set(authHeader)
      .send({ answerId: "answer-1", value: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "answerId and value (+1 or -1) are required" });
    expect(mockedPrisma.answer.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when answer does not exist", async () => {
    mockedPrisma.answer.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/vote").set(authHeader).send({
      answerId: "missing-id",
      value: 1,
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Answer not found" });
    expect(mockedPrisma.vote.create).not.toHaveBeenCalled();
  });
});

describe("POST /vote branches", () => {
  it("creates a new upvote when no prior vote exists", async () => {
    mockedPrisma.answer.findUnique.mockResolvedValue(sampleAnswer);
    mockedPrisma.vote.findUnique.mockResolvedValue(null);
    mockedPrisma.vote.create.mockResolvedValue(upvote);
    mockedPrisma.vote.aggregate.mockResolvedValue(mockVoteAggregate(1));

    const res = await request(app).post("/vote").set(authHeader).send({
      answerId: "answer-1",
      value: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        vote: upvote,
        score: 1,
      },
    });
    expect(mockedPrisma.vote.create).toHaveBeenCalledWith({
      data: {
        answerId: "answer-1",
        userId: "user-1",
        value: 1,
      },
    });
    expect(mockedPrisma.vote.update).not.toHaveBeenCalled();
    expect(mockedPrisma.vote.delete).not.toHaveBeenCalled();
  });

  it("flips an existing upvote to a downvote", async () => {
    mockedPrisma.answer.findUnique.mockResolvedValue(sampleAnswer);
    mockedPrisma.vote.findUnique.mockResolvedValue(upvote);
    mockedPrisma.vote.update.mockResolvedValue(downvote);
    mockedPrisma.vote.aggregate.mockResolvedValue(mockVoteAggregate(-1));

    const res = await request(app).post("/vote").set(authHeader).send({
      answerId: "answer-1",
      value: -1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        vote: downvote,
        score: -1,
      },
    });
    expect(mockedPrisma.vote.update).toHaveBeenCalledWith({
      where: { id: "vote-1" },
      data: { value: -1 },
    });
    expect(mockedPrisma.vote.create).not.toHaveBeenCalled();
    expect(mockedPrisma.vote.delete).not.toHaveBeenCalled();
  });

  it("cancels a vote when the same value is sent again", async () => {
    mockedPrisma.answer.findUnique.mockResolvedValue(sampleAnswer);
    mockedPrisma.vote.findUnique.mockResolvedValue(upvote);
    mockedPrisma.vote.delete.mockResolvedValue(upvote);
    mockedPrisma.vote.aggregate.mockResolvedValue(mockVoteAggregate(null));

    const res = await request(app).post("/vote").set(authHeader).send({
      answerId: "answer-1",
      value: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        vote: null,
        score: 0,
      },
    });
    expect(mockedPrisma.vote.delete).toHaveBeenCalledWith({
      where: { id: "vote-1" },
    });
    expect(mockedPrisma.vote.create).not.toHaveBeenCalled();
    expect(mockedPrisma.vote.update).not.toHaveBeenCalled();
  });
});

describe("GET /getVotes", () => {
  it("returns 400 when questionId is missing", async () => {
    const res = await request(app).get("/getVotes").set(authHeader);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "questionId is required" });
  });

  it("returns 400 when questionId is an array query param", async () => {
    const res = await request(app)
      .get("/getVotes")
      .query({ questionId: ["a", "b"] })
      .set(authHeader);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "questionId is required" });
    expect(mockedPrisma.question.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when question does not exist", async () => {
    mockedPrisma.question.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/getVotes")
      .query({ questionId: "missing-id" })
      .set(authHeader);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Question not found" });
  });

  it("returns score and myVote per answer", async () => {
    mockedPrisma.question.findUnique.mockResolvedValue({
      id: "question-1",
      answers: [
        {
          id: "answer-1",
          votes: [
            { value: 1, userId: "user-1" },
            { value: 1, userId: "user-2" },
            { value: -1, userId: "user-3" },
          ],
        },
        {
          id: "answer-2",
          votes: [],
        },
      ],
    } as never);

    const res = await request(app)
      .get("/getVotes")
      .query({ questionId: "question-1" })
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        votes: [
          { answerId: "answer-1", score: 1, myVote: 1 },
          { answerId: "answer-2", score: 0, myVote: null },
        ],
      },
    });
  });
});
