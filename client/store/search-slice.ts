import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IThread } from "@/interfaces/thread";

export interface UserSearchResult {
  username: string;
  name: string;
  avatar: string;
  bio?: string | null;
  isFollowing: boolean;
}

export type ThreadSearchResult = IThread;

interface SearchState {
  mode: "user" | "thread";
  queryUser: string;
  queryThread: string;
  users: UserSearchResult[];
  threads: ThreadSearchResult[];
}

const initialState: SearchState = {
  mode: "user",
  queryThread: "",
  queryUser: "",
  users: [],
  threads: [],
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<"user" | "thread">) {
      state.mode = action.payload;
    },
    setQueryUser(state, action: PayloadAction<string>) {
      state.queryUser = action.payload;
    },
    setQueryThread(state, action: PayloadAction<string>) {
      state.queryThread = action.payload;
    },
    setUsers(state, action: PayloadAction<UserSearchResult[]>) {
      state.users = action.payload;
    },
    setThreads(state, action: PayloadAction<ThreadSearchResult[]>) {
      state.threads = action.payload;
    },
    updateSearchThread(state, action: PayloadAction<IThread>) {
      const updated = action.payload;
      const index = state.threads.findIndex((t) => t._id === updated._id);
      if (index !== -1) {
        state.threads[index] = updated;
      }
    },
    deleteSearchThread(state, action: PayloadAction<string>) {
      const threadId = action.payload;
      state.threads = state.threads.filter((t) => t._id !== threadId);
    },
  },
});

export const {
  setMode,
  setQueryUser,
  setQueryThread,
  setUsers,
  setThreads,
  updateSearchThread,
  deleteSearchThread,
} = searchSlice.actions;

export default searchSlice.reducer;
