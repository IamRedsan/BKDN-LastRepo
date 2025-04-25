import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IThread } from "@/interfaces/thread";

interface ProfileThreadState {
  threads: IThread[];
}

const initialState: ProfileThreadState = {
  threads: [],
};

const profileThreadSlice = createSlice({
  name: "profileThread",
  initialState,
  reducers: {
    setThreads(state, action: PayloadAction<IThread[]>) {
      state.threads = action.payload;
    },
    addThread(state, action: PayloadAction<IThread>) {
      state.threads.unshift(action.payload); // Add new thread to the top
    },
    updateThread(state, action: PayloadAction<IThread>) {
      const index = state.threads.findIndex(
        (thread) => thread._id === action.payload._id
      );
      if (index !== -1) {
        state.threads[index] = action.payload;
      }
    },
    deleteThread(state, action: PayloadAction<string>) {
      state.threads = state.threads.filter(
        (thread) => thread._id !== action.payload
      );
    },
  },
});

export const { setThreads, addThread, updateThread, deleteThread } =
  profileThreadSlice.actions;
export default profileThreadSlice.reducer;
