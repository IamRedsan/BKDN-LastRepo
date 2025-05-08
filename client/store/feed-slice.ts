import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IThread } from "@/interfaces/thread";

interface FeedState {
  threads: IThread[];
}

const initialState: FeedState = {
  threads: [],
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeedThreads: (state, action: PayloadAction<IThread[]>) => {
      state.threads = action.payload;
    },
    addFeedThread: (state, action: PayloadAction<IThread>) => {
      state.threads.unshift(action.payload);
    },
    removeFeedThread: (state, action: PayloadAction<string>) => {
      state.threads = state.threads.filter(
        (thread) => thread._id !== action.payload
      );
    },
    updateFeedThread: (state, action) => {
      state.threads = state.threads.map((thread) =>
        thread._id === action.payload._id ? { ...action.payload } : thread
      );
    },
  },
});

export const {
  setFeedThreads,
  addFeedThread,
  removeFeedThread,
  updateFeedThread,
} = feedSlice.actions;

export default feedSlice.reducer;
