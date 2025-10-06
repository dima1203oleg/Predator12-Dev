import { configureStore } from '@reduxjs/toolkit';
import analyticsSlice from './analyticsSlice';

export const store = configureStore({
  reducer: {
    analytics: analyticsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
