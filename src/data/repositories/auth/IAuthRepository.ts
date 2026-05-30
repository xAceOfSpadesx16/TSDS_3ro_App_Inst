import { User } from '../../models/User';

export interface IAuthRepository {
  login(dni: string, password: string): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
