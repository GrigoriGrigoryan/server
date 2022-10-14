import { CreateUserDto } from '../../../User/dto/user.dto';
import { User } from '../../../User/user.entity';
import { LoginDto, RefreshAccessTokenDto } from '../../dto';
import { AuthTokenPair } from '../../../../common';
import { JwtPayload } from 'jsonwebtoken';
import { Session } from '../../session.entity';

export const createUserDto: CreateUserDto = {
  name: 'Name',
  email: 'Email',
  password: 'Password',
};

export const user: User = {
  id: '1',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  verified: true,
  createdAt: new Date('00/00/0000'),
  updatedAt: new Date('00/00/0000'),
};

export const serializedUser = {
  id: '1',
  name: 'Name',
  email: 'Email',
};

export const loginDto: LoginDto = {
  email: 'Email',
  password: 'Password',
};

export const authTokenPair: AuthTokenPair = {
  accessToken: 'qwertyuiop',
  refreshToken: 'asdfghjklz',
};

export const activationToken = 'zxcvbnmasd';

export const userJwtPayload: JwtPayload = {
  id: '1',
};

export const refreshAccessTokenDto: RefreshAccessTokenDto = {
  refreshToken: 'asdfghjklz',
};

export const session: Session = {
  id: '1',
  refreshToken: 'asdfghjklz',
  user,
};

export const newAccessToken: Partial<AuthTokenPair> = {
  accessToken: 'poiuytrewq',
};
