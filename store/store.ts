import { configureStore } from '@reduxjs/toolkit';
import laskuReducer from './LaskuSlice';

export const store = configureStore({
  reducer: {
    lasku: laskuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;