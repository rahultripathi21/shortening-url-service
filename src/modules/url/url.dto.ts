import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class ShortenUrlDTO {
  @ApiProperty({
    description: 'The URL to be shortened',
  })
  @IsNotEmpty({ message: 'URL must not be empty' })
  @IsUrl({}, { message: 'Invalid URL format' })
  url: string;
}
