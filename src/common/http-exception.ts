import { HttpStatus } from './http-status';
import { ErrorResponse } from './interfaces';

export class HttpException extends Error {
  constructor(
    public message,
    public statusCode: HttpStatus,
    public error: string | string[],
  ) {
    super(message);
  }

  getResponse(): ErrorResponse {
    return {
      message: this.message,
      statusCode: this.statusCode,
      error: this.error,
    };
  }
}

export class BadRequestHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Bad Request', HttpStatus.BAD_REQUEST, error);
  }
}

export class UnauthorizedHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Unauthorized', HttpStatus.UNAUTHORIZED, error);
  }
}

export class ForbiddenHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Forbidden', HttpStatus.FORBIDDEN, error);
  }
}

export class NotFoundHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Not Found', HttpStatus.NOT_FOUND, error);
  }
}

export class ConflictHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Conflict', HttpStatus.CONFLICT, error);
  }
}

export class InternalServerErrorHttpException extends HttpException {
  constructor(error: string | string[]) {
    super('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}
