import { GoalsData } from "../services/goalsService";
import { LeaderboardData } from "../services/leaderboardService";
import { RecognitionData } from "../services/recognitionService";
import { ScanSummary } from "../services/scanSummaryService";
import { Tip } from "../services/tipsService";

interface CardBuildInput {
  scanSummary: ScanSummary;
  leaderboard: LeaderboardData;
  recognition: RecognitionData;
  goals: GoalsData;
  tip: Tip;
}

const buildLeaderboardColumns = (leaderboard: LeaderboardData) => {
  if (!leaderboard.entries.length) {
    return [
      {
        type: "Column",
        width: "stretch",
        items: [
          {
            type: "TextBlock",
            text: "No recent leaderboard data",
            isSubtle: true,
            wrap: true,
          },
        ],
      },
    ];
  }

  return leaderboard.entries.map((entry, index) => {
    const columnItems: Record<string, unknown>[] = [
      {
        type: "TextBlock",
        text: `#${index + 1} ${entry.teamName}`,
        weight: "Bolder",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: `${entry.resolvedCount} resolved`,
        spacing: "None",
      },
    ];

    if (entry.streakWeeks !== undefined) {
      columnItems.push({
        type: "TextBlock",
        text: `${entry.streakWeeks} week streak 🔥`,
        spacing: "None",
        isSubtle: true,
      });
    }

    return {
      type: "Column",
      width: "stretch",
      items: columnItems,
    };
  });
};

const buildGoalsColumns = (goals: GoalsData) => {
  if (!goals.items.length) {
    return [
      {
        type: "Column",
        width: "stretch",
        items: [
          {
            type: "TextBlock",
            text: "No goal progress yet",
            isSubtle: true,
            wrap: true,
          },
        ],
      },
    ];
  }

  return goals.items.map((item) => ({
    type: "Column",
    width: "stretch",
    items: [
      {
        type: "TextBlock",
        text: item.name,
        weight: "Bolder",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: `${item.current}% / ${item.target}%`,
        spacing: "None",
      },
    ],
  }));
};

export const teamsCard = {
  build({ scanSummary, leaderboard, recognition, goals, tip }: CardBuildInput) {
    const body: Record<string, unknown>[] = [
      {
        type: "TextBlock",
        size: "Large",
        weight: "Bolder",
        text: `🔔 Scan completed: ${scanSummary.scanName}`,
      },
    ];

    if (scanSummary.target) {
      body.push({
        type: "TextBlock",
        text: `Target: ${scanSummary.target}`,
        wrap: true,
        isSubtle: true,
      });
    }

    body.push(
      {
        type: "FactSet",
        facts: [
          { title: "Scanner", value: scanSummary.scanner },
          { title: "Status", value: scanSummary.status ?? "Unknown" },
        ],
      },
      {
        type: "ColumnSet",
        spacing: "Small",
        columns: [
          {
            type: "Column",
            width: "stretch",
            items: [
              { type: "TextBlock", text: "High", weight: "Bolder" },
              { type: "TextBlock", text: `${scanSummary.high}` },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              { type: "TextBlock", text: "Medium", weight: "Bolder" },
              { type: "TextBlock", text: `${scanSummary.medium}` },
            ],
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              { type: "TextBlock", text: "Low", weight: "Bolder" },
              { type: "TextBlock", text: `${scanSummary.low}` },
            ],
          },
        ],
      },
      {
        type: "TextBlock",
        text: `🏆 Team leaderboard (${leaderboard.periodLabel})`,
        weight: "Bolder",
        size: "Medium",
        spacing: "Large",
      },
      {
        type: "ColumnSet",
        columns: buildLeaderboardColumns(leaderboard),
      },
      {
        type: "TextBlock",
        text: "🕵️ Bug Bounty Hunter of the Moment",
        weight: "Bolder",
        size: "Medium",
        spacing: "Large",
      },
      {
        type: "TextBlock",
        text: `**${recognition.bugHunterName}** - ${recognition.bugHunterReason}`,
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "🏅 Security Champion Spotlight",
        weight: "Bolder",
        size: "Medium",
        spacing: "Large",
      },
      {
        type: "TextBlock",
        text: `**${recognition.championSpotlightName}** - ${recognition.championSpotlightNote}`,
        wrap: true,
      },
      {
        type: "TextBlock",
        text: `🎯 ${goals.label}`,
        weight: "Bolder",
        size: "Medium",
        spacing: "Large",
      },
      {
        type: "ColumnSet",
        columns: buildGoalsColumns(goals),
      },
      {
        type: "TextBlock",
        text: "💡 Did you know?",
        weight: "Bolder",
        size: "Medium",
        spacing: "Large",
      },
      {
        type: "TextBlock",
        text: tip.text,
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "🤫 Tip: To mute this bot, right-click the channel name in Teams and choose \"Channel notifications\".",
        isSubtle: true,
        spacing: "Large",
        size: "Small",
        wrap: true,
      }
    );

    const card: Record<string, unknown> = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.4",
      body,
    };

    if (scanSummary.reportUrl) {
      card.actions = [
        {
          type: "Action.OpenUrl",
          title: "View full report",
          url: scanSummary.reportUrl,
        },
      ];
    }

    return card;
  },
};
