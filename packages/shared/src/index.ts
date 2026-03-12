export type UserRole = 'ADMIN' | 'DEVELOPER';

export type Provider = 'EMAIL' | 'GOOGLE' | 'GITHUB' | 'DISCORD';

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
