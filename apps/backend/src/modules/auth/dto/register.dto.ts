import { IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  garageId?: string;
}
