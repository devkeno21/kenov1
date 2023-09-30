import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface DrawState {
  status: "transition" | "showing" | "countdown";
}

const initialState: DrawState = {
  status: "countdown",
};

const drawSlice = createSlice({
  name: "draw",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<'transition' | 'showing' | 'countdown'>) => {
      state.status = action.payload;
    },
  },
});

export const { setStatus } = drawSlice.actions;
export default drawSlice.reducer;

// Define a RootState type to use in your Redux store
export type RootState = {
  draw: DrawState;
};