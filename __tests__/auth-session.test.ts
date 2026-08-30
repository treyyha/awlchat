import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: () => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: mockAuth,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("next-auth/providers/resend", () => ({
  default: vi.fn(() => ({})),
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {},
}));

import { getCurrentSession, getCurrentUserId } from "../lib/auth";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("session allowlist recheck", () => {
  it("allows an existing session whose email remains allowed", async () => {
    vi.stubEnv("ALLOWED_EMAILS", "owner@example.com");
    const session = {
      user: { id: "user_1", email: "owner@example.com" },
    };
    mockAuth.mockResolvedValue(session);

    await expect(getCurrentSession()).resolves.toEqual(session);
    await expect(getCurrentUserId()).resolves.toBe("user_1");
  });

  it("rejects an existing session after its email is removed from the allowlist", async () => {
    vi.stubEnv("ALLOWED_EMAILS", "other@example.com");
    mockAuth.mockResolvedValue({
      user: { id: "user_1", email: "owner@example.com" },
    });

    await expect(getCurrentSession()).resolves.toBeNull();
    await expect(getCurrentUserId()).resolves.toBeNull();
  });
});
