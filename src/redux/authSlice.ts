import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type User = {
  name: string;
  role: "user" | "admin";
} | null;

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null as User },
  reducers: {
    setAuthUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearAuthUser(state) {
      state.user = null;
    },
  },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
