import { UserRole } from '../enums/index.js';

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}
