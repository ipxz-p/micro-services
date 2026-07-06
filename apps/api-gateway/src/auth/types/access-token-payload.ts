export type AccessTokenPayload = {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
};
