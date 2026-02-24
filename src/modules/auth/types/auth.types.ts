export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshRequest {
  refreshToken: string
}
