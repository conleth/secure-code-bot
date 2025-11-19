import goalsJson from "../../data/goals.json";

export interface GoalItem {
  name: string;
  current: number;
  target: number;
}

export interface GoalsData {
  label: string;
  items: GoalItem[];
}

const goalsData = goalsJson as GoalsData;

export const goalsService = {
  async getGoalsProgress(): Promise<GoalsData> {
    return goalsData;
  },
};
