import axios from "axios";
import path from "node:path";
import { parse as parseCsv } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { config } from "../config";

export interface LeaderboardEntry {
  teamName: string;
  resolvedCount: number;
  streakWeeks?: number;
}

export interface LeaderboardData {
  periodLabel: string;
  entries: LeaderboardEntry[];
}

type LeaderboardFormat = "csv" | "xlsx";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const normalizeRows = (rows: Record<string, unknown>[]): LeaderboardEntry[] => {
  return rows
    .map((row) => {
      const lowered = Object.entries(row).reduce<Record<string, unknown>>((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      }, {});

      const teamName = String(lowered["team"] ?? "").trim();
      if (!teamName) {
        return undefined;
      }
      const resolved = toNumber(lowered["resolvedlast7days"] ?? lowered["resolved"]);
      const streak = lowered["streakweeks"];
      const streakWeeks = streak === undefined || streak === "" ? undefined : toNumber(streak);

      return {
        teamName,
        resolvedCount: resolved,
        streakWeeks,
      } as LeaderboardEntry;
    })
    .filter((entry): entry is LeaderboardEntry => Boolean(entry));
};

const parseCsvFile = (buffer: Buffer): Record<string, unknown>[] => {
  const content = buffer.toString("utf-8");
  return parseCsv(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];
};

const parseXlsxFile = (buffer: Buffer): Record<string, unknown>[] => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return (XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[]);
};

const detectFormat = (extension: string, contentType?: string): LeaderboardFormat => {
  if (extension === ".csv") {
    return "csv";
  }
  if (extension === ".xlsx" || extension === ".xls") {
    return "xlsx";
  }
  if (contentType?.includes("csv")) {
    return "csv";
  }
  if (contentType?.includes("spreadsheet")) {
    return "xlsx";
  }
  throw new Error("Unsupported leaderboard file format");
};

const downloadLeaderboardFile = async (): Promise<{ buffer: Buffer; contentType?: string; extension: string }> => {
  const response = await axios.get(config.leaderboardFileUrl, {
    responseType: "arraybuffer",
    // TODO: Inject SharePoint/Graph authentication headers when details are available.
  });
  const extension = path.extname(config.leaderboardFileUrl).toLowerCase();
  return {
    buffer: Buffer.from(response.data),
    contentType: response.headers["content-type"] as string | undefined,
    extension,
  };
};

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardData> {
    const { buffer, contentType, extension } = await downloadLeaderboardFile();
    const format = detectFormat(extension, contentType);
    const rows = format === "csv" ? parseCsvFile(buffer) : parseXlsxFile(buffer);
    const entries = normalizeRows(rows)
      .sort((a, b) => b.resolvedCount - a.resolvedCount)
      .slice(0, 3);

    return {
      periodLabel: "last 7 days",
      entries,
    };
  },
};
