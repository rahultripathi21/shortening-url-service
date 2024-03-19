import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { UserRepository } from '../modules/user/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public readonly userRepository: UserRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      throw new HttpException(
        'Authorization Token must be provided',
        HttpStatus.UNAUTHORIZED,
      );
    }
    req.user = await this.validateToken(req.headers.authorization);
    return true;
  }

  async validateToken(auth: string) {
    try {
      if (auth.split(' ')[0] !== 'Bearer')
        throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
      const token = auth.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const userDetails = await this.userRepository.findUser({
        _id: decoded._id,
      });
      if (!userDetails) throw new NotFoundException('User not found');
      return decoded;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
  }
}

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
}

export const GetUserData = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
