import { createSlice } from '@reduxjs/toolkit';

const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    minutes: 0,
    seconds: 0,
  },
  reducers: {
    setMinutes: (state, action) => {
      state.minutes = action.payload;
    },
    setSeconds: (state, action) => {
      state.seconds = action.payload;
    },
  },
});

export const { setMinutes, setSeconds } = timerSlice.actions;
export default timerSlice.reducer;
