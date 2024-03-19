import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SignUpDTO, SignInDTO } from './user.dto';

describe('UserController', () => {
  let userService: UserService;
  let userController: UserController;

  const mockSignUpDto: SignUpDTO = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'testpassword',
  };

  const mockSignInDto: SignInDTO = {
    email: 'test@example.com',
    password: 'testpassword',
  };

  const mockSignUpResult = {
    message: 'successfully signed up',
    token: 'abc123',
  };

  const mockSignInResult = {
    message: 'Successfully signed in',
    token: 'xyz456',
  };

  const mockUserService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call userService.signUp and return the result', async () => {
      jest.spyOn(userService, 'signUp').mockResolvedValue(mockSignUpResult);
      const result = await userController.signUp(mockSignUpDto);

      expect(userService.signUp).toHaveBeenCalledWith(mockSignUpDto);
      expect(result).toEqual(mockSignUpResult);
    });
  });

  describe('signIn', () => {
    it('should call userService.signIn and return the result', async () => {
      jest.spyOn(userService, 'signIn').mockResolvedValue(mockSignInResult);
      const result = await userController.signIn(mockSignInDto);

      expect(userService.signIn).toHaveBeenCalledWith(mockSignInDto);
      expect(result).toEqual(mockSignInResult);
    });
  });
});
