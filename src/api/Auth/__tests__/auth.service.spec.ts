import bcrypt from 'bcryptjs';

import { AuthService } from '../auth.service';
import { UserService } from '../../User/user.service';
import { TokenService } from '../token.service';
import { EmailService } from '../email.service';
import { Repository } from 'typeorm';
import {
  user,
  createUserDto,
  serializedUser,
  loginDto,
  authTokenPair,
  activationToken,
  userJwtPayload,
  refreshAccessTokenDto,
  newAccessToken,
  session,
} from './helpers/auth.service.data';
import {
  ConflictHttpException,
  ForbiddenHttpException,
  TokenTypes,
  UnauthorizedHttpException,
} from '../../../common';
import { Session } from '../session.entity';

jest.mock('../../User/user.service');
jest.mock('../token.service');
jest.mock('../email.service');

describe('AuthService', () => {
  let userService: jest.MockedObject<UserService>;
  let tokenService: jest.MockedObject<TokenService>;
  let emailService: jest.MockedObject<EmailService>;
  let sessionRepository: jest.MockedObject<Repository<Session>>;

  let authService: AuthService;

  beforeAll(() => {
    userService = new UserService() as jest.MockedObject<UserService>;
    tokenService = new TokenService() as jest.MockedObject<TokenService>;
    emailService = new EmailService() as jest.MockedObject<EmailService>;
    sessionRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.MockedObject<Repository<Session>>;

    authService = new AuthService(
      userService,
      tokenService,
      emailService,
      sessionRepository,
    );

    tokenService.generateAuthTokenPair.mockResolvedValue(authTokenPair);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should call getEmailById in UserService with user email', async () => {
      await authService.register(createUserDto);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });

    test('should throw HttpConflictException if user exists', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      await expect(authService.register(createUserDto)).rejects.toBeInstanceOf(
        ConflictHttpException,
      );
    });

    test('should create user with hashed password if user does not exist', async () => {
      const hashedPassword = '###########';
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedPassword));

      userService.getUserByEmail.mockResolvedValueOnce(void 0);

      await authService.register(createUserDto);
      expect(userService.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
    });

    test('should send validation email after creating user', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(''));
      userService.getUserByEmail.mockResolvedValueOnce(void 0);
      userService.createUser.mockResolvedValueOnce(user);

      await authService.register(createUserDto);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(user);
    });

    test('should return serialized user data', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(''));
      userService.getUserByEmail.mockResolvedValueOnce(void 0);
      userService.createUser.mockResolvedValueOnce(user);

      const result = await authService.register(createUserDto);

      expect(result).toEqual(serializedUser);
    });
  });

  describe('login', () => {
    test('should try to get user with user email', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      await authService.login(loginDto);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    test('should throw UnauthorizedHttpException if user does not exists', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(void 0);

      await expect(authService.login(createUserDto)).rejects.toBeInstanceOf(
        UnauthorizedHttpException,
      );
    });

    test('should throw UnauthorizedHttpException if user password is not correct', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(authService.login(createUserDto)).rejects.toBeInstanceOf(
        UnauthorizedHttpException,
      );
    });

    test('should throw ForbiddenHttpException if user is not verified', async () => {
      userService.getUserByEmail.mockResolvedValueOnce({
        ...user,
        verified: false,
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      await expect(authService.login(createUserDto)).rejects.toBeInstanceOf(
        ForbiddenHttpException,
      );
    });

    test('should create auth token pair with user id', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      await authService.login(loginDto);

      expect(tokenService.generateAuthTokenPair).toHaveBeenCalledWith(user.id);
    });

    test('should create auth session with refresh token', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(authService, 'createAuthSession');
      await authService.login(loginDto);

      expect(authService.createAuthSession).toHaveBeenCalledWith(
        authTokenPair.refreshToken,
      );
    });

    test('should return auth token pair', async () => {
      userService.getUserByEmail.mockResolvedValueOnce(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const result = await authService.login(loginDto);

      expect(result).toEqual(authTokenPair);
    });
  });

  describe('validateUser', () => {
    test('should verify activation token', async () => {
      tokenService.verifyToken.mockResolvedValueOnce(userJwtPayload);
      await authService.validateUser(activationToken);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(
        activationToken,
        TokenTypes.ACTIVATION,
      );
    });

    test('should validate user with user id', async () => {
      tokenService.verifyToken.mockResolvedValueOnce(userJwtPayload);
      await authService.validateUser(activationToken);

      expect(userService.validateUser).toHaveBeenCalledWith(userJwtPayload.id);
    });
  });

  describe('refreshAccessToken', () => {
    test('should find session with refresh token', async () => {
      sessionRepository.findOne.mockResolvedValueOnce(session);
      tokenService.verifyToken.mockResolvedValueOnce({ userId: '1' });
      await authService.refreshAccessToken(refreshAccessTokenDto);

      expect(sessionRepository.findOne).toHaveBeenCalledWith(
        refreshAccessTokenDto,
      );
    });

    test('should verify token', async () => {
      sessionRepository.findOne.mockResolvedValueOnce(session);
      await authService.refreshAccessToken(refreshAccessTokenDto);

      expect(tokenService.verifyToken).toHaveBeenCalledWith(
        refreshAccessTokenDto.refreshToken,
        TokenTypes.REFRESH,
      );
    });

    test('should sign new refresh token', async () => {
      sessionRepository.findOne.mockResolvedValueOnce(session);
      tokenService.verifyToken.mockResolvedValueOnce(userJwtPayload);
      await authService.refreshAccessToken(refreshAccessTokenDto);

      expect(tokenService.signToken).toHaveBeenCalledWith(
        TokenTypes.ACCESS,
        userJwtPayload,
      );
    });

    test('should return a new access token', async () => {
      sessionRepository.findOne.mockResolvedValueOnce(session);

      tokenService.signToken.mockResolvedValueOnce(newAccessToken.accessToken);

      const result = await authService.refreshAccessToken(
        refreshAccessTokenDto,
      );

      expect(result).toEqual(newAccessToken);
    });
  });
});
