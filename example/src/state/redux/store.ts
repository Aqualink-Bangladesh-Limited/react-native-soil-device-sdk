import { configureStore } from "@reduxjs/toolkit";
import { soilReducer } from "./soilSlice";

export const store = configureStore({
  reducer: { soil: soilReducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
