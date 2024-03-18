import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UserRepository } from './user.repository';
import { SignInDTO, SignUpDTO } from './user.dto';
import { HelperService } from '../helper/helper.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly helperService: HelperService,
  ) {}

  async signUp({ email, name, password }: SignUpDTO) {
    try {
      const userExist = await this.userRepository.finduser({ email });
      if (userExist) throw new ConflictException('User email already exists');

      const hash = await this.helperService.encodePassword(password);

      await this.userRepository.createUser({
        email,
        name,
        password: hash,
      });

      return { message: 'successfully signed up' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }

  async signIn({ email, password }: SignInDTO) {
    try {
      const userExist = await this.userRepository.finduser({ email });
      if (!userExist) {
        throw new NotFoundException('User does not exist');
      }

      if (
        !(await this.helperService.verifyPassword(userExist.password, password))
      ) {
        throw new BadRequestException('Password is incorrect');
      }

      const token = this.helperService.createJwtToken({
        _id: userExist._id.toString(),
        email: userExist.email,
        name: userExist.name,
      });

      return { message: 'Successfully signed in', token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }
}
