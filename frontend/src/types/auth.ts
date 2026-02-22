export interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id?: number | null;
  email: string;
  name?: string | null;
}

export interface SignInResponse {
  token: string;
  user: AuthUser;
  expiresAt?: string | null;
}

export interface SignUpResponse {
  user: AuthUser;
  message?: string;
}
