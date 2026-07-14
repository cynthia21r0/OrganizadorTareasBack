import { IsEmail, IsEnum, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';
import { FamilyRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @IsEmail({}, { message: 'Correo no válido' })
  email!: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsEnum(FamilyRole, { message: 'Rol familiar no válido' })
  role!: FamilyRole;

  // Envía familyName SOLO si vas a crear una familia nueva
  @ValidateIf((o) => !o.inviteCode)
  @IsNotEmpty({ message: 'familyName es obligatorio si no envías un inviteCode' })
  familyName?: string;

  // Envía inviteCode SOLO si te vas a unir a una familia existente
  @ValidateIf((o) => !o.familyName)
  @IsNotEmpty({ message: 'inviteCode es obligatorio si no envías familyName' })
  inviteCode?: string;
}