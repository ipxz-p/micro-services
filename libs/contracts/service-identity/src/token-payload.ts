export type JwtTokenType = 'access' | 'refresh';

export type JwtTokenPayload = {
  sub: number;
  email: string;
  type: JwtTokenType;
};
