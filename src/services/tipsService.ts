import tipsJson from "../../data/tips.json";

export interface Tip {
  id: string;
  text: string;
  category: string;
  scanners: string[];
}

const tipsData = tipsJson as Tip[];

const normalizeScanner = (scanner?: string): string | undefined => {
  return scanner?.toLowerCase();
};

const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const tipsService = {
  async pickTip({ scanner }: { scanner?: string }): Promise<Tip> {
    const normalizedScanner = normalizeScanner(scanner);
    const matches = normalizedScanner
      ? tipsData.filter((tip) => tip.scanners.map((name) => name.toLowerCase()).includes(normalizedScanner))
      : [];

    if (matches.length > 0) {
      return pickRandom(matches);
    }

    const generalTips = tipsData.filter((tip) =>
      tip.scanners.map((name) => name.toLowerCase()).includes("general")
    );

    if (generalTips.length > 0) {
      return pickRandom(generalTips);
    }

    return pickRandom(tipsData);
  },
};
