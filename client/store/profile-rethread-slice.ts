import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IThread } from "@/interfaces/thread";

interface ProfileReThreadState {
  reThreads: IThread[];
}

const initialState: ProfileReThreadState = {
  reThreads: [],
};

const profileReThreadSlice = createSlice({
  name: "profileReThread",
  initialState,
  reducers: {
    setReThreads(state, action: PayloadAction<IThread[]>) {
      state.reThreads = action.payload;
    },
    addReThread(state, action: PayloadAction<IThread>) {
      state.reThreads.unshift(action.payload); // Add new reThread to the top
    },
    updateReThread(state, action: PayloadAction<IThread>) {
      const index = state.reThreads.findIndex(
        (reThread) => reThread._id === action.payload._id
      );
      if (index !== -1) {
        state.reThreads[index] = action.payload;
      }
    },
    deleteReThread(state, action: PayloadAction<string>) {
      state.reThreads = state.reThreads.filter(
        (reThread) => reThread._id !== action.payload
      );
    },
  },
});

export const { setReThreads, addReThread, updateReThread, deleteReThread } =
  profileReThreadSlice.actions;
export default profileReThreadSlice.reducer;
