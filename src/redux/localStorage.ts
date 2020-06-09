import { State } from "./types";

export const loadState = (): State | undefined => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }

    let state = JSON.parse(serializedState);
    return state;
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: State) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.log("Error while saving to local storage: ", err);
  }
};
