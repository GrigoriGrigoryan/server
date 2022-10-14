import { injectable } from 'inversify';
import { getRepository, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

import { config } from '../../config';
import { CreateUserDto } from '../User/dto/user.dto';
import { RegisterDto, LoginDto, RefreshAccessTokenDto } from './dto';
import {
  AuthTokenPair,
  ConflictHttpException,
  TokenTypes,
  UnauthorizedHttpException,
  ForbiddenHttpException,
  validateDTO,
  serializeDTO,
  logger,
} from '../../common';
import { UserService } from '../User/user.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { Session } from './session.entity';

@injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService = new UserService(),
    private readonly tokenService: TokenService = new TokenService(),
    private readonly emailService: EmailService = new EmailService(),
    private readonly sessionRepository: Repository<Session> = getRepository(
      Session,
    ),
  ) {
    logger.info("'AuthService' initialized");
  }

  public async register(userDto: CreateUserDto): Promise<RegisterDto> {
    await validateDTO(userDto, CreateUserDto);

    const { email, password } = userDto;

    const existingUser = await this.userService.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictHttpException(
        `User with email '${email}' already exists`,
      );
    }

    const { saltRound } = config.auth;
    const hash = await bcrypt.hash(password, saltRound);

    const user = await this.userService.createUser({
      ...userDto,
      password: hash,
    });

    await this.emailService.sendVerificationEmail(user);
    return serializeDTO(user, RegisterDto);
  }

  public async login(loginDTO: LoginDto): Promise<AuthTokenPair> {
    await validateDTO(loginDTO, LoginDto);

    const { email, password } = loginDTO;

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedHttpException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedHttpException('Invalid email or password');
    }

    if (!user.verified) {
      throw new ForbiddenHttpException('User not verified');
    }

    const authTokenPair = await this.tokenService.generateAuthTokenPair(
      user.id,
    );

    await this.createAuthSession(authTokenPair.refreshToken);

    return authTokenPair;
  }

  public async validateUser(activationToken: string): Promise<void> {
    const userPayload = await this.tokenService.verifyToken(
      activationToken,
      TokenTypes.ACTIVATION,
    );

    await this.userService.validateUser(userPayload.id);
  }

  public async refreshAccessToken(
    refreshAccessTokenDto: RefreshAccessTokenDto,
  ): Promise<Partial<AuthTokenPair>> {
    await validateDTO(refreshAccessTokenDto, RefreshAccessTokenDto);

    const { refreshToken } = refreshAccessTokenDto;

    const session = await this.sessionRepository.findOne({ refreshToken });
    if (!session) {
      throw new UnauthorizedHttpException('Invalid session');
    }

    const userPayload = await this.tokenService.verifyToken(
      refreshToken,
      TokenTypes.REFRESH,
    );

    const accessToken = await this.tokenService.signToken(
      TokenTypes.ACCESS,
      userPayload,
    );
    return { accessToken };
  }

  public async createAuthSession(refreshToken: string) {
    await this.sessionRepository.save({
      refreshToken,
    });
  }
}
