import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";
import { signToken } from "../src/utils/jwt";

const mockedPrisma = vi.mocked(prisma, true);

const testUser = {
  id: "user-1",
  nickname: "dev_alice",
  fullName: "Alice Cohen",
  email: "alice@ivtech.dev",
  passwordHash: hashPassword("password123"),
};

describe("POST /login", () => {
  it("returns 200 with JWT and user on valid credentials", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(testUser);

    const res = await request(app).post("/login").send({
      email: "alice@ivtech.dev",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toEqual({
      id: testUser.id,
      nickname: testUser.nickname,
      fullName: testUser.fullName,
      email: testUser.email,
    });
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("returns 400 when email or password is missing", async () => {
    const res = await request(app).post("/login").send({ email: "alice@ivtech.dev" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Email and password are required" });
    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid credentials", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(testUser);

    const res = await request(app).post("/login").send({
      email: "alice@ivtech.dev",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("returns 401 when user does not exist", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/login").send({
      email: "missing@ivtech.dev",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });
});

describe("GET /userInfo", () => {
  it("returns 401 without Authorization header", async () => {
    const res = await request(app).get("/userInfo");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 for invalid JWT", async () => {
    const res = await request(app)
      .get("/userInfo")
      .set("Authorization", "Bearer not-a-valid-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 with user profile for valid JWT", async () => {
    const token = signToken({ userId: testUser.id, email: testUser.email });
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: testUser.id,
      nickname: testUser.nickname,
      fullName: testUser.fullName,
      email: testUser.email,
    });

    const res = await request(app).get("/userInfo").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      id: testUser.id,
      nickname: testUser.nickname,
      fullName: testUser.fullName,
      email: testUser.email,
    });
  });

  it("returns 404 when token user no longer exists", async () => {
    const token = signToken({ userId: "missing-user", email: "gone@ivtech.dev" });
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/userInfo").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });
});
