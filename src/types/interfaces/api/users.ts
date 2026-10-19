export interface ApiUser {
  id: string,
  name: string,
  role: string,
}

export interface AuthSession {
  accessToken: string,
  expiresAt: string,
  tokenType: string,
  user: ApiUser,
}
