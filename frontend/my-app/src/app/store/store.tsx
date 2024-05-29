// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import userCities from "./userCities";

const store = configureStore({
  reducer: {
    cities: useCities,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
