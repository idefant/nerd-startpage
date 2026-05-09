import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { mainApi } from '#api/mainApi';
import { defaultConfig } from '#configs/defaultConfig';
import { Config } from '#types/configType';

export type ConfigState = {
  configUrl?: string;
  config: Config;
  wasResetDueToInvalidConfig: boolean;
};

const initialState: ConfigState = {
  configUrl: undefined,
  config: defaultConfig,
  wasResetDueToInvalidConfig: false,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigUrl(state, { payload }: PayloadAction<string>) {
      state.configUrl = payload;
    },
    clearWasResetDueToInvalidConfig(state) {
      state.wasResetDueToInvalidConfig = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(mainApi.endpoints.fetchConfig.matchFulfilled, (state, { payload }) => {
      if (!payload) return;
      state.config = payload;
    });
  },
});

export const { setConfigUrl, clearWasResetDueToInvalidConfig } = configSlice.actions;

export const configReducer = configSlice.reducer;
