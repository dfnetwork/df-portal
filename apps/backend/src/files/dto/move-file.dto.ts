import { IsString } from 'class-validator';

export class MoveFileDto {
  @IsString()
  targetFolderId: string;
}
