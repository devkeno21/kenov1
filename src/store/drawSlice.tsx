import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface DrawState {
  status: "transition" | "showing" | "countdown";
  gameNumber: number
}

const initialState: DrawState = {
  status: "countdown",
  gameNumber: 0
};

const drawSlice = createSlice({
  name: "draw",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<'transition' | 'showing' | 'countdown'>) => {
      state.status = action.payload;
    },
    setGameNumber: (state, action: PayloadAction<number>) => {
      console.log(`Set game number called ${action.payload}`)
      state.gameNumber = action.payload
    }
  },
});

export const { setStatus, setGameNumber } = drawSlice.actions;
export default drawSlice.reducer;

// Define a RootState type to use in your Redux store
export type RootState = {
  draw: DrawState;
};