import { configureStore } from "@reduxjs/toolkit";
import profileThreadReducer from "./profile-thread-slice";
import profileReThreadReducer from "./profile-rethread-slice";
import searchReducer from "./search-slice";

const store = configureStore({
  reducer: {
    profileThread: profileThreadReducer,
    profileReThread: profileReThreadReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
