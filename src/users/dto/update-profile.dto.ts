import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Ingresa un correo válido" })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password?: string;

  // Requerida solo si se está mandando una nueva contraseña
  @ValidateIf((dto: UpdateProfileDto) => !!dto.password)
  @IsString()
  currentPassword?: string;
}