import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Correo no válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
