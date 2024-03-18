import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { IUserDoc } from './user.interface';

export const USER_SCHEMA_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

export const UserSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserSchemaModule = MongooseModule.forFeature([
  {
    name: USER_SCHEMA_NAME,
    schema: UserSchema,
    collection: USER_COLLECTION_NAME,
  },
]);
