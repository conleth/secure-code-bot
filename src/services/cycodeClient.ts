import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config";

export interface TeamFindingStats {
  teamName: string;
  resolvedCountLast7Days: number;
  criticalOpen: number;
  highOpen: number;
}

const TEST_STATS_PATH = path.join(process.cwd(), "data", "test", "cycodeTeamStats.json");

const loadTestStats = async (): Promise<TeamFindingStats[]> => {
  const content = await fs.readFile(TEST_STATS_PATH, "utf8");
  return JSON.parse(content) as TeamFindingStats[];
};

export const cycodeClient = {
  async getTeamFindingStats(): Promise<TeamFindingStats[]> {
    if (!config.cycodeBaseUrl || !config.cycodeToken) {
      return loadTestStats();
    }

    // TODO: Replace with real Cycode API endpoint.
    // Fetch teams, resolved findings last 7 days, open criticals, etc.
    // Return array of:
    // { teamName, resolvedCountLast7Days, criticalOpen, highOpen }
    return [];
  },
};
