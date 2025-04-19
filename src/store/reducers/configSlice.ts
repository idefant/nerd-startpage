import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { mainApi } from '#api/mainApi';
import { Config } from '#types/configType';

type ConfigState = {
  configUrl?: string;
  config?: Config;
};

const initialState: ConfigState = {
  configUrl: undefined,
  config: undefined,
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
