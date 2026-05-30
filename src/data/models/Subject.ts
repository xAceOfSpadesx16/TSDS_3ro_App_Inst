import { ScheduleEntry } from './ScheduleEntry';

export interface SubjectLocation {
  floor: number;
  roomNumber: string;
  additionalDetails?: string;
}

export interface Subject {
  id: string;
  name: string;
  professorName: string;
  location: SubjectLocation;
  schedule: ScheduleEntry[];
  color: string;
}
