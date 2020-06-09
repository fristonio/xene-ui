import { LOGIN_COMPLETED, LOGOUT_COMPLETED } from "./../types";

export function login(email: string, authToken: string) {
  return {
    type: LOGIN_COMPLETED,
    payload: {
      isAuthenticated: true,
      authToken,
      email,
    },
  };
}

export function logout() {
  return {
    type: LOGOUT_COMPLETED,
    payload: {
      isAuthenticated: false,
    },
  };
}
