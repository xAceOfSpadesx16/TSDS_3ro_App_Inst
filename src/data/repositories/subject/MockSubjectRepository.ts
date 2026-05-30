import { Subject } from '../../models/Subject';
import { User } from '../../models/User';
import { ISubjectRepository } from './ISubjectRepository';
import {
  isSubjectActive,
  getCurrentSubject,
  getRemainingSubjectsForToday,
} from '../../../utils/scheduleUtils';

const MOCK_USERS: User[] = [
  { dni: '35123456', firstName: 'Ana', lastName: 'García', password: '1234', subjectIds: ['s1', 's2', 's3'] },
  { dni: '28654321', firstName: 'Carlos', lastName: 'Rodríguez', password: '1234', subjectIds: ['s1', 's3', 's4', 's5'] },
  { dni: '41987654', firstName: 'María', lastName: 'López', password: '1234', subjectIds: ['s2', 's4', 's5'] },
];

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Matemáticas',
    professorName: 'Prof. Roberto García',
    location: { floor: 2, roomNumber: '201', additionalDetails: 'Laboratorio de cálculo' },
    schedule: [
      { dayOfWeek: 1, startHour: 18, startMinute: 0, endHour: 20, endMinute: 0 },
      { dayOfWeek: 3, startHour: 18, startMinute: 0, endHour: 20, endMinute: 0 },
    ],
    color: '#4A90E2',
  },
  {
    id: 's2',
    name: 'Programación Web',
    professorName: 'Prof. Laura Méndez',
    location: { floor: 3, roomNumber: '305', additionalDetails: 'Laboratorio de computación – traer notebook' },
    schedule: [
      { dayOfWeek: 1, startHour: 20, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 4, startHour: 18, startMinute: 0, endHour: 21, endMinute: 0 },
    ],
    color: '#27AE60',
  },
  {
    id: 's3',
    name: 'Base de Datos',
    professorName: 'Prof. Alejandro Torres',
    location: { floor: 1, roomNumber: '110', additionalDetails: 'Planta baja, ala norte' },
    schedule: [
      { dayOfWeek: 2, startHour: 18, startMinute: 0, endHour: 21, endMinute: 0 },
    ],
    color: '#F39C12',
  },
  {
    id: 's4',
    name: 'Algoritmos y Estructuras',
    professorName: 'Prof. Valeria Fernández',
    location: { floor: 2, roomNumber: '208', additionalDetails: 'Sala con proyector – llegar 5 min antes' },
    schedule: [
      { dayOfWeek: 3, startHour: 20, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 5, startHour: 18, startMinute: 0, endHour: 22, endMinute: 0 },
    ],
    color: '#8E44AD',
  },
  {
    id: 's5',
    name: 'Redes y Comunicaciones',
    professorName: 'Prof. Diego González',
    location: { floor: 3, roomNumber: '302', additionalDetails: 'Laboratorio de redes – gabinetes disponibles' },
    schedule: [
      { dayOfWeek: 4, startHour: 21, startMinute: 0, endHour: 23, endMinute: 0 },
    ],
    color: '#E74C3C',
  },
];

let debugDate: Date | null = null;

export function setDebugDate(date: Date | null): void {
  debugDate = date;
}

function getEffectiveDate(date: Date): Date {
  return debugDate ?? date;
}

export class MockSubjectRepository implements ISubjectRepository {
  async getSubjectsByUserDni(userDni: string): Promise<Subject[]> {
    const user = MOCK_USERS.find(u => u.dni === userDni);
    if (!user) return [];
    return MOCK_SUBJECTS.filter(s => user.subjectIds.includes(s.id));
  }

  async getCurrentSubject(userDni: string, date: Date): Promise<Subject | null> {
    const subjects = await this.getSubjectsByUserDni(userDni);
    return getCurrentSubject(subjects, getEffectiveDate(date));
  }

  async getRemainingSubjectsForToday(userDni: string, date: Date): Promise<Subject[]> {
    const subjects = await this.getSubjectsByUserDni(userDni);
    return getRemainingSubjectsForToday(subjects, getEffectiveDate(date));
  }
}
