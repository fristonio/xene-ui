import { createStore } from "redux";
import rootReducer from "./reducers";
import { State } from "./types";
import { saveState, loadState } from "./localStorage";
import _ from "lodash";

let s = loadState();
let st: State = {
  isAuthenticated: false,
  email: "",
  authToken: "",
};

if (s !== undefined) {
  st.email = s.email === undefined ? "" : s.email;
  st.authToken = s.authToken === undefined ? "" : s.authToken;
  st.isAuthenticated = s.isAuthenticated;
}

export default function configureStore() {
  console.log(st);
  let store = createStore(rootReducer, { auth: st });

  store.subscribe(
    _.throttle(() => {
      saveState({
        email: store.getState().auth.email,
        authToken: store.getState().auth.authToken,
        isAuthenticated: store.getState().auth.isAuthenticated,
      });
    }, 1000)
  );

  return store;
}
