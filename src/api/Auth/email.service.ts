import mailSender from '@sendgrid/mail';
import { config } from '../../config';
import { TokenService } from './token.service';
import { logger, TokenTypes } from '../../common';
import { User } from '../User/user.entity';
import { Mail } from '../../common';

export class EmailService {
  constructor(
    private readonly tokenService: TokenService = new TokenService(),
  ) {
    mailSender.setApiKey(config.email.apiKey);
    logger.info("'EmailService' initialized");
  }

  public composeEmail(
    to: string | string[],
    subject: string,
    body: string,
  ): Mail {
    return {
      from: config.email.senderAddress,
      to,
      subject,
      html: body,
    };
  }

  public async getActivationLink(userId: string): Promise<string> {
    const activationToken = await this.tokenService.signToken(
      TokenTypes.ACTIVATION,
      { userId },
    );
    const { host, port } = config.server;
    return `${host}:${port}/activation/${activationToken}`;
  }

  public async sendVerificationEmail(user: User): Promise<void> {
    const activationLink = await this.getActivationLink(user.id);
    const emailMessage = this.composeEmail(
      user.email,
      'Email verification',
      `
      <h1>Welcome ${user.name}!</h1>
      <p>We are happy you registered in our site</p>
      <p>To verify your account please click on this 
         <a href="${activationLink}">activation link</a>
      </p>
    `,
    );

    await mailSender.send(emailMessage);
  }

  public async sendPasswordResetEmail(user: User): Promise<void> {
    const activationLink = await this.getActivationLink(user.id);
    const emailMessage = this.composeEmail(
      user.email,
      'Reset Password',
      `
      <h1>Hi ${user.name}!</h1>
      <p>To reset your password please click on this 
         <a href="${activationLink}">link</a>
      </p>
    `,
    );

    await mailSender.send(emailMessage);
  }
}
