import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { mainApi } from '#api/mainApi';

type ConfigState = {
  configUrl: string | undefined;
  config: any;
};

const initialState: ConfigState = {
  configUrl: '',
  config: [],
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigUrl(state, { payload }: PayloadAction<string>) {
      state.configUrl = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(mainApi.endpoints.fetchConfig.matchFulfilled, (state, { payload }) => {
      if (!payload) return;
      state.config = payload;
    });
  },
});

export const { setConfigUrl } = configSlice.actions;

export const configReducer = configSlice.reducer;
