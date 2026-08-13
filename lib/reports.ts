import { getRedis } from "./redis";

const REPORTS_KEY = "lapd:reports";

export const REPORT_TEMPLATE_URL =
  "https://docs.google.com/document/d/14mUo5P02kAgRRqKCfXfEn0wUkvAo8iwC/edit#heading=h.gjdgxs";

export type Report = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorCharacterName: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
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
