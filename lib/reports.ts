import { getRedis } from "./redis";

const REPORTS_KEY = "lapd:reports";

export const REPORT_TYPES = [
  "Rapport d'incident",
  "Rapport d'arrestation",
  "Rapport d'usage de la force",
  "Rapport général",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export type Report = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorCharacterName: string | null;
  type: ReportType;
  title: string;
  content: string;
  createdAt: string;
};

export async function listReports(): Promise<Report[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, Report>>(REPORTS_KEY)) || {};
  return Object.values(all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createReport(
  input: Omit<Report, "id" | "createdAt">
): Promise<Report | null> {
  const redis = getRedis();
  if (!redis) return null;

  const report: Report = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await redis.hset(REPORTS_KEY, { [report.id]: report });
  return report;
}
