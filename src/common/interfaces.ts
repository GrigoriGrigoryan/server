export interface SuccessResponse {
  data: any;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error: string | string[];
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Mail {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}
