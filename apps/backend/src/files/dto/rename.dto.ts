import { IsString } from 'class-validator';

export class RenameDto {
  @IsString()
  name: string;
}
