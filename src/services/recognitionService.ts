import recognitionJson from "../../data/recognition.json";

export interface RecognitionData {
  bugHunterName: string;
  bugHunterReason: string;
  championSpotlightName: string;
  championSpotlightNote: string;
}

const recognitionData = recognitionJson as RecognitionData;

export const recognitionService = {
  async getRecognition(): Promise<RecognitionData> {
    return recognitionData;
  },
};
