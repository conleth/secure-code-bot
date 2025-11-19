import { Router } from "express";
import { goalsService } from "../services/goalsService";
import { leaderboardService } from "../services/leaderboardService";
import { recognitionService } from "../services/recognitionService";
import { scanSummaryService } from "../services/scanSummaryService";
import { teamsClient } from "../services/teamsClient";
import { tipsService } from "../services/tipsService";
import { teamsCard } from "../templates/teamsCard";

export const secureCodeBoxWebhookRouter = Router();

secureCodeBoxWebhookRouter.post("/webhooks/securecodebox", async (req, res) => {
  try {
    const scanPayload = req.body;

    const scanSummary = scanSummaryService.buildSummary(scanPayload);
    const leaderboard = await leaderboardService.getLeaderboard();
    const recognition = await recognitionService.getRecognition();
    const goals = await goalsService.getGoalsProgress();
    const tip = await tipsService.pickTip({ scanner: scanSummary.scanner });

    const card = teamsCard.build({
      scanSummary,
      leaderboard,
      recognition,
      goals,
      tip,
    });

    await teamsClient.postCard(card as any);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});
