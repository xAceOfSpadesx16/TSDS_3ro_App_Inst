import { User } from '../../models/User';
import { IAuthRepository } from './IAuthRepository';

const MOCK_USERS: User[] = [
  {
    dni: '35123456',
    firstName: 'Ana',
    lastName: 'García',
    password: '1234',
    subjectIds: ['s1', 's2', 's3'],
  },
  {
    dni: '28654321',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    password: '1234',
    subjectIds: ['s1', 's3', 's4', 's5'],
  },
  {
    dni: '41987654',
    firstName: 'María',
    lastName: 'López',
    password: '1234',
    subjectIds: ['s2', 's4', 's5'],
  },
];

let currentUser: User | null = null;

export class MockAuthRepository implements IAuthRepository {
  async login(dni: string, password: string): Promise<User | null> {
    const user = MOCK_USERS.find(u => u.dni === dni && u.password === password);
    if (user) {
      currentUser = user;
      return user;
    }
    return null;
  }

  async logout(): Promise<void> {
    currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return currentUser;
  }
}
