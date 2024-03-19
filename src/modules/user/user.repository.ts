import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { USER_SCHEMA_NAME } from './user.schema';
import { IUserDoc } from './user.interface';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(USER_SCHEMA_NAME)
    private readonly userModel: Model<IUserDoc>,
  ) {}

  async createUser(userData) {
    return this.userModel.create(userData);
  }

  async findUser(query): Promise<IUserDoc> {
    return this.userModel.findOne(query);
  }
}
