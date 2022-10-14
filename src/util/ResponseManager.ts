import { Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
  ErrorResponse,
  HttpException,
  HttpStatus,
  InternalServerErrorHttpException,
  SuccessResponse,
  UnauthorizedHttpException,
} from '../common';
import { logger } from '../common';

export class ResponseManager {
  public static ok(res: Response, data: any = {}): void {
    const response = ResponseManager.getSuccessResponse(data);
    res.status(HttpStatus.OK).send(response);
  }

  public static created(res: Response, data: any): void {
    const response = ResponseManager.getSuccessResponse(data);
    res.status(HttpStatus.CREATED).send(response);
  }

  public static error(res: Response, error: unknown): void {
    const response = ResponseManager.getErrorResponse(error);
    res.status(response.statusCode).send(response);
  }

  private static getSuccessResponse(data: any): SuccessResponse {
    return {
      data,
    };
  }

  private static getErrorResponse(error: unknown): ErrorResponse {
    if (error instanceof HttpException) {
      return error.getResponse();
    } else if (error instanceof JsonWebTokenError) {
      return new UnauthorizedHttpException(error.message).getResponse();
    }
    console.log(error);
    logger.error(error);

    return new InternalServerErrorHttpException(
      'Something went wrong',
    ).getResponse();
  }
}
