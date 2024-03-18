import { Module } from '@nestjs/common';
import { UserSchemaModule } from './user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [UserSchemaModule, HelperModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
