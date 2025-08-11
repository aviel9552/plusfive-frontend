import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../src/redux/reducers/authReducer';
import qrReducer from '../src/redux/reducers/qrReducer';
import userReducer from '../src/redux/reducers/userReducer';
import referralReducer from '../src/redux/reducers/referralReducer';
import customerReducer from '../src/redux/reducers/customerReducer';

// Root Reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  qr: qrReducer,
  referral: referralReducer,
  customer: customerReducer,
});

// Persist Config
const persistConfig = {
  key: "root", // Key for the root
  storage, // Use localStorage to persist
  whitelist: ["user", "token"], // Persist only user and token
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Needed for redux-persist
    }),
});

export const persistor = persistStore(store);
