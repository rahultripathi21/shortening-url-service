import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDTO, SignUpDTO } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDTO) {
    return this.userService.signUp(dto);
  }

  @Post('sign-in')
  async signIn(@Body() dto: SignInDTO) {
    return this.userService.signIn(dto);
  }
}
