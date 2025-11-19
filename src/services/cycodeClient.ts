export interface TeamFindingStats {
  teamName: string;
  resolvedCountLast7Days: number;
  criticalOpen: number;
  highOpen: number;
}

export const cycodeClient = {
  async getTeamFindingStats(): Promise<TeamFindingStats[]> {
    // TODO: Replace with real Cycode API endpoint.
    // Fetch teams, resolved findings last 7 days, open criticals, etc.
    // Return array of:
    // { teamName, resolvedCountLast7Days, criticalOpen, highOpen }
    return [];
  },
};
