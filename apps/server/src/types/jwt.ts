import type { Jsonify } from 'type-fest';
export interface JwtPayload {
  userId: number;
  username: string;
  exp: number;
}

export type JwtPayloadJSON = Jsonify<JwtPayload>;
