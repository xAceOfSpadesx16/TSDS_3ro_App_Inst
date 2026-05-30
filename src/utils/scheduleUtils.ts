import { Subject } from '../data/models/Subject';
import { ScheduleEntry } from '../data/models/ScheduleEntry';

export function isSubjectActive(subject: Subject, date: Date): boolean {
  const entry = getTodayScheduleEntry(subject, date);
  if (!entry) return false;

  const now = date.getHours() * 60 + date.getMinutes();
  const start = entry.startHour * 60 + entry.startMinute;
  const end = entry.endHour * 60 + entry.endMinute;

  return now >= start && now < end;
}

export function subjectHasClassToday(subject: Subject, date: Date): boolean {
  return getTodayScheduleEntry(subject, date) !== undefined;
}

export function getCurrentSubject(subjects: Subject[], date: Date): Subject | null {
  return subjects.find(s => isSubjectActive(s, date)) ?? null;
}

export function getRemainingSubjectsForToday(subjects: Subject[], date: Date): Subject[] {
  const now = date.getHours() * 60 + date.getMinutes();

  return subjects
    .filter(subject => {
      const entry = getTodayScheduleEntry(subject, date);
      if (!entry) return false;
      const start = entry.startHour * 60 + entry.startMinute;
      return start > now;
    })
    .sort((a, b) => {
      const entryA = getTodayScheduleEntry(a, date)!;
      const entryB = getTodayScheduleEntry(b, date)!;
      return (entryA.startHour * 60 + entryA.startMinute) - (entryB.startHour * 60 + entryB.startMinute);
    });
}

export function getTodayScheduleEntry(subject: Subject, date: Date): ScheduleEntry | undefined {
  const dayOfWeek = date.getDay();
  return subject.schedule.find(entry => entry.dayOfWeek === dayOfWeek);
}

export function formatTimeRange(entry: ScheduleEntry): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(entry.startHour)}:${pad(entry.startMinute)} – ${pad(entry.endHour)}:${pad(entry.endMinute)}`;
}
