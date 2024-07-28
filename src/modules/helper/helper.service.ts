import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { hash, verify } from 'argon2';
import ShortUniqueId from 'short-unique-id';

@Injectable()
export class HelperService {
  constructor(private readonly configService: ConfigService) {}
  encodePassword(password: string): Promise<string> {
    return hash(password);
  }

  verifyPassword(hash: string, password: string): Promise<boolean> {
    return verify(hash, password);
  }

  createJwtToken(payload: any): Promise<string> {
    return sign(payload, this.configService.get('JWT_SECRET_KEY'), {
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });
  }

  generateShortCode(): string {
    const uid = new ShortUniqueId({ length: 7 });
    return uid.rnd();
  }
}
