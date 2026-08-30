import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockContext,
  mockGetJobCounts,
  mockGetWorkerHealth,
  mockGetWorkerAlerts,
  mockWebhookFindMany,
  mockDmFindMany,
  mockOperationalFindMany,
} = vi.hoisted(() => ({
  mockContext: vi.fn(),
  mockGetJobCounts: vi.fn(),
  mockGetWorkerHealth: vi.fn(),
  mockGetWorkerAlerts: vi.fn(),
  mockWebhookFindMany: vi.fn(),
  mockDmFindMany: vi.fn(),
  mockOperationalFindMany: vi.fn(),
}));

vi.mock("@/lib/workspace-access", () => ({
  canManageWorkspace: (role: string) => role === "OWNER" || role === "ADMIN",
  getCurrentWorkspaceContext: mockContext,
}));

vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ getJobCounts: mockGetJobCounts }),
}));

vi.mock("@/lib/ops/worker-health", () => ({
  getWorkerHealth: mockGetWorkerHealth,
  getWorkerAlerts: mockGetWorkerAlerts,
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    webhookEvent: { findMany: mockWebhookFindMany },
    dmLog: { findMany: mockDmFindMany },
    operationalEvent: { findMany: mockOperationalFindMany },
  },
}));

import { GET } from "../app/api/admin/diagnostics/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetJobCounts.mockResolvedValue({});
  mockGetWorkerHealth.mockResolvedValue({ healthy: true });
  mockGetWorkerAlerts.mockResolvedValue([]);
  mockWebhookFindMany.mockResolvedValue([]);
  mockDmFindMany.mockResolvedValue([]);
  mockOperationalFindMany.mockResolvedValue([]);
});

describe("diagnostics access control", () => {
  it("rejects regular workspace members before reading diagnostics", async () => {
    mockContext.mockResolvedValue({
      userId: "user_1",
      workspaceId: "workspace_1",
      role: "MEMBER",
    });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(mockGetJobCounts).not.toHaveBeenCalled();
    expect(mockOperationalFindMany).not.toHaveBeenCalled();
  });

  it("scopes operational events and worker alerts to the current workspace", async () => {
    mockContext.mockResolvedValue({
      userId: "user_1",
      workspaceId: "workspace_1",
      role: "ADMIN",
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockGetWorkerAlerts).toHaveBeenCalledWith("workspace_1", 10);
    expect(mockOperationalFindMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { workspaceId: "workspace_1" },
      })
    );
  });
});
