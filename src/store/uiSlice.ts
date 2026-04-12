import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  loading: boolean;
  activeModal: string | null;
};

const initialState: UiState = {
  loading: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const { closeModal, openModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
