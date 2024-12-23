export type Event = {
  id: number;
  eventName: string;
  startTime: string;
  endTime: string;
  description?: string;
  date: Date;
  category: 'work' | 'personal' | 'others'; // New field for event category
};
