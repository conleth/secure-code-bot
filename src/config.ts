import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  port: number;
  teamsWebhookUrl: string;
  cycodeBaseUrl?: string;
  cycodeToken?: string;
  leaderboardFileUrl?: string;
  nodeEnv: string;
}

const ensureEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const readOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value;
};

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return parsed;
};

export const config: AppConfig = {
  port: parsePort(process.env.PORT, 3004),
  teamsWebhookUrl: ensureEnv("TEAMS_WEBHOOK_URL"),
  cycodeBaseUrl: readOptionalEnv("CYCOD_API_BASE_URL"),
  cycodeToken: readOptionalEnv("CYCOD_API_TOKEN"),
  leaderboardFileUrl: readOptionalEnv("SHAREPOINT_LEADERBOARD_FILE_URL"),
  nodeEnv: process.env.NODE_ENV ?? "development",
};
