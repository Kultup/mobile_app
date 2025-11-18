export interface JwtPayload {
  sub: string; // user id
  username: string;
  role: string;
  type: 'admin' | 'user';
}

