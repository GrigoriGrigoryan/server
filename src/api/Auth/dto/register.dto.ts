import { Expose } from 'class-transformer';

export class RegisterDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
}
