import { prisma } from "@/lib/db/client";
import {
  calculateCtr,
  normalizeTopKeywords,
  summarizeDmStatuses,
} from "@/lib/tracking/analytics";
import { buildReportUrl, isReportBranded } from "@/lib/reports/share";

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getDayWindow(daysAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - daysAgo);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getCampaignReportBySlug(shareSlug: string) {
  const automation = await prisma.automation.findFirst({
    where: {
      reportShareSlug: shareSlug,
      reportShareEnabled: true,
    },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      goal: true,
      postUrl: true,
      keywords: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      reportShareSlug: true,
      workspace: {
        select: {
          name: true,
        },
      },
      instagramAccount: {
        select: {
          username: true,
        },
      },
      trackedLinks: {
        select: {
          id: true,
          slug: true,
          destinationUrl: true,
          _count: { select: { clicks: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!automation || !automation.reportShareSlug) {
    return null;
  }

  const [statusRows, clickCount, keywordRows, latestSentLog] =
    await Promise.all([
      prisma.dmLog.groupBy({
        by: ["status"],
        where: {
          workspaceId: automation.workspaceId,
          automationId: automation.id,
        },
        _count: { _all: true },
      }),
      prisma.linkClick.count({
        where: {
          workspaceId: automation.workspaceId,
          automationId: automation.id,
        },
      }),
      prisma.dmLog.groupBy({
        by: ["matchedKeyword"],
        where: {
          workspaceId: automation.workspaceId,
          automationId: automation.id,
          matchedKeyword: { not: null },
        },
        _count: { _all: true },
      }),
      prisma.dmLog.findFirst({
        where: {
          workspaceId: automation.workspaceId,
          automationId: automation.id,
          status: "SENT",
        },
        orderBy: { dmSentAt: "desc" },
        select: { dmSentAt: true, createdAt: true },
      }),
    ]);

  const statusSummary = summarizeDmStatuses(
    statusRows.map((row) => ({
      status: row.status,
      _count: row._count._all,
    }))
  );
  const topKeywords = normalizeTopKeywords(
    keywordRows.map((row) => ({
      matchedKeyword: row.matchedKeyword,
      _count: row._count._all,
    }))
  );
  const dailyWindows = Array.from({ length: 7 }, (_, index) =>
    getDayWindow(6 - index)
  );
  const dailyStart = dailyWindows[0].start;
  const dailyEnd = dailyWindows[dailyWindows.length - 1].end;
  const [dailySentRows, dailyClickRows] = await Promise.all([
    prisma.dmLog.findMany({
      where: {
        workspaceId: automation.workspaceId,
        automationId: automation.id,
        status: "SENT",
        createdAt: { gte: dailyStart, lt: dailyEnd },
      },
      select: { createdAt: true },
    }),
    prisma.linkClick.findMany({
      where: {
        workspaceId: automation.workspaceId,
        automationId: automation.id,
        createdAt: { gte: dailyStart, lt: dailyEnd },
      },
      select: { createdAt: true },
    }),
  ]);

  function countRowsByDay(rows: Array<{ createdAt: Date }>) {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const date = row.createdAt;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  const dailySentCounts = countRowsByDay(dailySentRows);
  const dailyClickCounts = countRowsByDay(dailyClickRows);
  const daily = dailyWindows.map(({ start }) => {
    const key = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
    return {
      date: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sent: dailySentCounts.get(key) ?? 0,
      clicks: dailyClickCounts.get(key) ?? 0,
    };
  });

  return {
    shareSlug: automation.reportShareSlug,
    reportUrl: buildReportUrl(automation.reportShareSlug),
    generatedAt: new Date(),
    branded: isReportBranded(),
    workspace: {
      name: automation.workspace.name,
    },
    campaign: {
      name: automation.name,
      goal: automation.goal,
      postUrl: automation.postUrl,
      keywords: automation.keywords,
      isActive: automation.isActive,
      createdAt: automation.createdAt,
      updatedAt: automation.updatedAt,
      instagramUsername: automation.instagramAccount.username,
    },
    metrics: {
      sent: statusSummary.sent,
      skipped: statusSummary.skipped,
      failed: statusSummary.failed,
      clicks: clickCount,
      ctr: calculateCtr(clickCount, statusSummary.sent),
      latestSentAt: latestSentLog?.dmSentAt ?? latestSentLog?.createdAt ?? null,
    },
    topKeywords,
    daily,
    trackedLinks: automation.trackedLinks.map((link) => ({
      slug: link.slug,
      destinationHost: getHostname(link.destinationUrl),
      clicks: link._count.clicks,
    })),
  };
}
