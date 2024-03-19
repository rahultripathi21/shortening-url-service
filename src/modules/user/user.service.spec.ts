import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { HelperService } from '../helper/helper.service';

import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IUserDoc } from './user.interface';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let helperService: HelperService;

  const mockUserRepository = {
    createUser: jest.fn(),
    findUser: jest.fn(),
  };

  const mockHelperService = {
    encodePassword: jest.fn(),
    verifyPassword: jest.fn(),
    createJwtToken: jest.fn(),
  };

  const signUpDTO = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
  };

  const existingUserDTO = {
    email: 'existing@example.com',
    name: 'Existing User',
    password: 'password',
  };

  const nonexistentUserDTO = {
    email: 'nonexistent@example.com',
    password: 'password',
  };

  const incorrectPasswordDTO = {
    email: 'test@example.com',
    password: 'incorrectPassword',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: HelperService,
          useValue: mockHelperService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    helperService = module.get<HelperService>(HelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully sign up user', async () => {
      jest.spyOn(userRepository, 'findUser').mockResolvedValueOnce(null);
      jest
        .spyOn(helperService, 'encodePassword')
        .mockResolvedValueOnce('hashedPassword');
      await userService.signUp(signUpDTO);
      expect(userRepository.findUser).toHaveBeenCalledWith({
        email: signUpDTO.email,
      });
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email: signUpDTO.email,
        name: signUpDTO.name,
        password: 'hashedPassword',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const mockUser: Partial<IUserDoc> = {
        email: existingUserDTO.email,
        name: existingUserDTO.name,
        password: existingUserDTO.password,
      };

      jest
        .spyOn(userRepository, 'findUser')
        .mockResolvedValueOnce(mockUser as any);

      await expect(userService.signUp(existingUserDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if any other error occurs', async () => {
      jest
        .spyOn(mockUserRepository, 'findUser')
        .mockRejectedValueOnce(new Error('Some error occurred'));
      await expect(userService.signUp(signUpDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      const mockUser = {
        _id: '65f92a47af4fde8088cfc249',
        email: signUpDTO.email,
        name: 'Test User',
        password: 'hashedPassword',
      };
      jest
        .spyOn(mockUserRepository, 'findUser')
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(helperService, 'verifyPassword').mockResolvedValueOnce(true);
      jest
        .spyOn(helperService, 'createJwtToken')
        .mockResolvedValueOnce('token');

      const result = await userService.signIn(signUpDTO);
      expect(result).toEqual({
        message: 'Successfully signed in',
        token: 'token',
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(mockUserRepository, 'findUser').mockResolvedValueOnce(null);
      await expect(userService.signIn(nonexistentUserDTO)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const mockUser = {
        _id: 'userId',
        email: signUpDTO.email,
        name: 'Test User',
        password: 'hashedPassword',
      };
      jest
        .spyOn(mockUserRepository, 'findUser')
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(helperService, 'verifyPassword').mockResolvedValueOnce(false);
      await expect(userService.signIn(incorrectPasswordDTO)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if any other error occurs', async () => {
      jest
        .spyOn(mockUserRepository, 'findUser')
        .mockRejectedValueOnce(new Error('Some error occurred'));
      await expect(userService.signIn(signUpDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
