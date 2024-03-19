import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserRepository } from './user.repository';
import { USER_SCHEMA_NAME } from './user.schema';
import { IUserDoc } from './user.interface';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userModel: Model<IUserDoc>;

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    email: 'test@example.com',
    name: 'Mock User',
    password: 'mockpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(USER_SCHEMA_NAME),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userModel = module.get<Model<IUserDoc>>(getModelToken(USER_SCHEMA_NAME));
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
      };

      jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await userRepository.createUser(userData);

      expect(userModel.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findUser', () => {
    it('should find a user', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);
      const result = await userRepository.findUser({ email: mockUser.email });
      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(result).toEqual(mockUser);
    });
  });
});
