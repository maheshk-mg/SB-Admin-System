export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthApiResponse {
  token?: string;
  access_token?: string;
  user?: User;
  data?: { token?: string; access_token?: string; user?: User };
}

export interface RegisterApiResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
