import { LOGIN_COMPLETED, LOGOUT_COMPLETED } from "../types";
import { State } from "./../types";

const initialState = {
  isAuthenticated: false,
  email: "",
  authToken: "",
};

interface AuthAction extends State {
  type: string;
  payload: State;
}

export default function (state = initialState, action: AuthAction) {
  switch (action.type) {
    case LOGIN_COMPLETED: {
      const { email, authToken } = action.payload;
      return Object.assign({}, state, {
        isAuthenticated: true,
        email,
        authToken,
      });
    }
    case LOGOUT_COMPLETED: {
      return Object.assign({}, state, {
        isAuthenticated: false,
        email: "",
        authToken: "",
      });
    }
    default:
      return state;
  }
}
