
import data from './first-aid-data.json';

export type FirstAidTopic = {
  key: string;
  title: string;
  importantNote: string;
  steps: string[];
};

export const firstAidData: FirstAidTopic[] = data;
