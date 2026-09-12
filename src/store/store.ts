import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { PersistConfig, PersistedState, persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { mainApi } from '#api/mainApi';
import { defaultConfig } from '#configs/defaultConfig';
import { configSchema } from '#schema/configSchema';

import { configReducer, ConfigState } from './reducers/configSlice';

const CONFIG_PERSIST_VERSION = 1;

const persistConfig: PersistConfig<ConfigState> = {
  key: 'config',
  storage,
  version: CONFIG_PERSIST_VERSION,
  migrate: async (state) => {
    if (!state) return state;

    const persisted = state as PersistedState & { config?: unknown; configUrl?: string };
    const result = configSchema.safeParse(persisted.config);

    if (!result.success) {
      return {
        ...persisted,
        config: defaultConfig,
        wasResetDueToInvalidConfig: true,
      };
    }

    return { ...persisted, config: result.data };
  },
};

export const rootReducer = combineReducers({
  config: persistReducer(persistConfig, configReducer),
  [mainApi.reducerPath]: mainApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(mainApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<() => typeof store>;
export type AppDispatch = AppStore['dispatch'];
