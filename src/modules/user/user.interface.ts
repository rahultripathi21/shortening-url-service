import { Document } from 'mongoose';

export interface IUserDoc extends Document {
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
