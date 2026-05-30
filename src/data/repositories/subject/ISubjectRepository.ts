import { Subject } from '../../models/Subject';

export interface ISubjectRepository {
  getSubjectsByUserDni(userDni: string): Promise<Subject[]>;
  getCurrentSubject(userDni: string, date: Date): Promise<Subject | null>;
  getRemainingSubjectsForToday(userDni: string, date: Date): Promise<Subject[]>;
}
