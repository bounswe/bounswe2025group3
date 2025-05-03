import { configureStore } from '@reduxjs/toolkit';
import wasteReducer from './wasteSlice';

export const store = configureStore({
  reducer: {
    waste: wasteReducer,
  },
});