import { IsNotEmpty, IsUrl } from 'class-validator';

export class ShortenUrlDTO {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
