export interface LoginRequest {
  email: string;
  password: String;
}

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}
