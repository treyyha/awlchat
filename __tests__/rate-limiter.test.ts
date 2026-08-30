/**
 * Rate Limiter — Unit Tests
 *
 * Tests the hourly private-reply cap enforcement using mocked Redis.
 * Assertions derive from RATE_LIMIT_MAX so they survive a change to the cap.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGet, mockEval, mockDel, mockSet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockEval: vi.fn(),
  mockDel: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("ioredis", () => {
  const MockRedis = vi.fn().mockImplementation(function (
    this: Record<string, unknown>
  ) {
    this.get = mockGet;
    this.eval = mockEval;
    this.del = mockDel;
    this.set = mockSet;
    return this;
  });
  return { default: MockRedis };
});

vi.stubEnv("REDIS_URL", "redis://localhost:6379");

import {
  checkRateLimit,
  incrementDMCounter,
  reserveDMSlot,
  RATE_LIMIT_MAX,
  allowInvalidWebhookRequest,
  allowMagicLinkRequest,
  claimWebhookDelivery,
  reserveAutomatedDmCooldown,
  releaseAutomatedDmCooldown,
  INVALID_WEBHOOK_MAX,
  INVALID_WEBHOOK_WINDOW,
  MAGIC_LINK_MAX,
  MAGIC_LINK_WINDOW,
  WEBHOOK_REPLAY_WINDOW,
  AUTOMATED_DM_DEDUP_TTL_SECONDS,
} from "../lib/utils/rate-limiter";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkRateLimit", () => {
  it("should allow when count is below limit", async () => {
    mockGet.mockResolvedValue("50");

    const result = await checkRateLimit("account_123");

    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(50);
    expect(result.remainingDMs).toBe(RATE_LIMIT_MAX - 50);
    expect(result.shouldRequeue).toBe(false);
    expect(result.shouldSkip).toBe(false);
    expect(result.reserved).toBe(false);
  });

  it("should allow when no previous count exists", async () => {
    mockGet.mockResolvedValue(null);

    const result = await checkRateLimit("account_123");

    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(0);
    expect(result.remainingDMs).toBe(RATE_LIMIT_MAX);
  });

  it("should deny when count reaches the limit", async () => {
    mockGet.mockResolvedValue(String(RATE_LIMIT_MAX));

    const result = await checkRateLimit("account_123");

    expect(result.allowed).toBe(false);
    expect(result.shouldRequeue).toBe(true);
    expect(result.shouldSkip).toBe(false);
  });

  it("should skip after max requeue attempts", async () => {
    mockGet.mockResolvedValue(String(RATE_LIMIT_MAX));

    const result = await checkRateLimit("account_123", 3);

    expect(result.allowed).toBe(false);
    expect(result.shouldRequeue).toBe(false);
    expect(result.shouldSkip).toBe(true);
  });
});

describe("reserveDMSlot", () => {
  it("should atomically reserve a slot when below the hourly cap", async () => {
    mockEval.mockResolvedValue([1, 51, 139]);

    const result = await reserveDMSlot("account_123");

    expect(mockEval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      "rate:dm:account_123",
      RATE_LIMIT_MAX,
      3600
    );
    expect(result.allowed).toBe(true);
    expect(result.reserved).toBe(true);
    expect(result.currentCount).toBe(51);
    expect(result.remainingDMs).toBe(139);
  });

  it("should recommend requeue when the atomic reserve is denied", async () => {
    mockEval.mockResolvedValue([0, RATE_LIMIT_MAX, 0]);

    const result = await reserveDMSlot("account_123", 0);

    expect(result.allowed).toBe(false);
    expect(result.reserved).toBe(false);
    expect(result.shouldRequeue).toBe(true);
    expect(result.shouldSkip).toBe(false);
  });

  it("should skip after max requeue attempts", async () => {
    mockEval.mockResolvedValue(["0", String(RATE_LIMIT_MAX), "0"]);

    const result = await reserveDMSlot("account_123", 3);

    expect(result.allowed).toBe(false);
    expect(result.shouldRequeue).toBe(false);
    expect(result.shouldSkip).toBe(true);
  });
});

describe("incrementDMCounter", () => {
  it("should use the atomic reservation path", async () => {
    mockEval.mockResolvedValue([1, 51, 139]);

    const count = await incrementDMCounter("account_123");

    expect(mockEval).toHaveBeenCalled();
    expect(count).toBe(51);
  });
});

describe("public request rate limits", () => {
  it("denies an invalid webhook request when its IP window is full", async () => {
    mockEval.mockResolvedValue(0);

    await expect(allowInvalidWebhookRequest("203.0.113.10")).resolves.toBe(
      false
    );
    expect(mockEval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      expect.stringMatching(/^rate:webhook-invalid:[a-f0-9]{64}$/),
      INVALID_WEBHOOK_MAX,
      INVALID_WEBHOOK_WINDOW
    );
  });

  it("allows a magic-link request while its IP window has capacity", async () => {
    mockEval.mockResolvedValue(1);

    await expect(allowMagicLinkRequest("203.0.113.10")).resolves.toBe(true);
    expect(mockEval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      expect.stringMatching(/^rate:magic-link:[a-f0-9]{64}$/),
      MAGIC_LINK_MAX,
      MAGIC_LINK_WINDOW
    );
  });

  it("claims a webhook payload only once during the replay window", async () => {
    mockSet.mockResolvedValueOnce("OK").mockResolvedValueOnce(null);

    await expect(claimWebhookDelivery('{"entry":[]}')).resolves.toBe(true);
    await expect(claimWebhookDelivery('{"entry":[]}')).resolves.toBe(false);
    expect(mockSet).toHaveBeenLastCalledWith(
      expect.stringMatching(/^webhook:delivery:[a-f0-9]{64}$/),
      "1",
      "EX",
      WEBHOOK_REPLAY_WINDOW,
      "NX"
    );
  });

  it("atomically reserves the automated DM cooldown for 24 hours", async () => {
    mockSet.mockResolvedValue("OK");

    await expect(
      reserveAutomatedDmCooldown("ig_456", "user_999")
    ).resolves.toBe(true);
    expect(mockSet).toHaveBeenCalledWith(
      "dedup:automated-dm:ig_456:user_999",
      "1",
      "EX",
      AUTOMATED_DM_DEDUP_TTL_SECONDS,
      "NX"
    );
  });

  it("returns false when the automated DM cooldown already exists", async () => {
    mockSet.mockResolvedValue(null);

    await expect(
      reserveAutomatedDmCooldown("ig_456", "user_999")
    ).resolves.toBe(false);
  });

  it("releases an automated DM cooldown after a failed send", async () => {
    mockDel.mockResolvedValue(1);

    await releaseAutomatedDmCooldown("ig_456", "user_999");

    expect(mockDel).toHaveBeenCalledWith(
      "dedup:automated-dm:ig_456:user_999"
    );
  });
});
