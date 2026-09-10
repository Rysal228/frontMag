export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenStorage = {
  read(): AuthTokens | null;
  write(tokens: AuthTokens): void;
  clear(): void;
};
