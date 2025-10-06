import { configureStore } from '@reduxjs/toolkit';
import analyticsSlice from './analyticsSlice';
export const store = configureStore({
    reducer: {
        analytics: analyticsSlice,
    },
});
