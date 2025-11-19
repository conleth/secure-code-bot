import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  port: number;
  teamsWebhookUrl: string;
  cycodeBaseUrl: string;
  cycodeToken: string;
  leaderboardFileUrl: string;
  nodeEnv: string;
}

const ensureEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
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
  cycodeBaseUrl: ensureEnv("CYCOD_API_BASE_URL"),
  cycodeToken: ensureEnv("CYCOD_API_TOKEN"),
  leaderboardFileUrl: ensureEnv("SHAREPOINT_LEADERBOARD_FILE_URL"),
  nodeEnv: process.env.NODE_ENV ?? "development",
};
