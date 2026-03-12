import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInviteDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;
}
