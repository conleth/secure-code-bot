export interface ScanSummary {
  scanName: string;
  scanner: string;
  target?: string;
  status?: string;
  high: number;
  medium: number;
  low: number;
  reportUrl?: string;
}

export const scanSummaryService = {
  buildSummary(scanPayload: any): ScanSummary {
    return {
      scanName: scanPayload?.scanName ?? "unknown-scan",
      scanner: scanPayload?.scanner ?? "general",
      target: scanPayload?.target,
      status: scanPayload?.status,
      high: scanPayload?.findings?.high ?? 0,
      medium: scanPayload?.findings?.medium ?? 0,
      low: scanPayload?.findings?.low ?? 0,
      reportUrl: scanPayload?.findingsUrl,
    };
  },
};
