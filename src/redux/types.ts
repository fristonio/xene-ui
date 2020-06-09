export interface State {
  isAuthenticated: boolean;
  email: string;
  authToken: string;
}

export const LOGIN_COMPLETED = "LOGIN_COMPLETED";
export const LOGOUT_COMPLETED = "LOGOUT_COMPLETED";
