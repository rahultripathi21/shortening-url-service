import { Body, Controller, Post } from '@nestjs/common';

import { UserService } from './user.service';
import { SignInDTO, SignUpDTO } from './user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('user')
@ApiTags('USER')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  @ApiBody({ type: SignUpDTO })
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully',
    schema: {
      properties: {
        message: { type: 'string', description: 'Success message' },
      },
    },
  })
  @ApiConflictResponse({ description: 'User email already exists' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async signUp(@Body() dto: SignUpDTO) {
    return this.userService.signUp(dto);
  }

  @Post('sign-in')
  @ApiBody({ type: SignInDTO })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    schema: {
      properties: {
        message: { type: 'string', description: 'Success message' },
        token: { type: 'string', description: 'JWT token' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Password is incorrect' })
  @ApiNotFoundResponse({ description: 'User does not exist' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async signIn(@Body() dto: SignInDTO) {
    return this.userService.signIn(dto);
  }
}
