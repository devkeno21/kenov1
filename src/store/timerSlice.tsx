import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'

// Define the state type
interface TimerState {
  minutes: number;
  seconds: number;
}

const initialState: TimerState = {
  minutes: 0,
  seconds: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setMinutes: (state, action: PayloadAction<number>) => {
      state.minutes = action.payload;
    },
    setSeconds: (state, action: PayloadAction<number>) => {
      state.seconds = action.payload;
    },
  },
});

export const { setMinutes, setSeconds } = timerSlice.actions;
export default timerSlice.reducer;

// Define a RootState type to use in your Redux store
export type RootState = {
  timer: TimerState;
};
