import { beforeEach, vi } from "vitest";

process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    question: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    answer: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    vote: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});
