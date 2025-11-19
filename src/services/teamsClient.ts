import axios from "axios";
import { config } from "../config";

export interface AdaptiveCardPayload {
  type: string;
  $schema: string;
  version: string;
  body: unknown[];
  actions?: unknown[];
}

export const teamsClient = {
  async postCard(card: AdaptiveCardPayload): Promise<void> {
    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: card,
        },
      ],
    };

    await axios.post(config.teamsWebhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
