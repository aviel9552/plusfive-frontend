import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage
import { combineReducers } from "redux";
import authReducer from "../src/redux/reducers/authReducer";
import userReducer from "../src/redux/reducers/userReducer";
import qrReducer from "../src/redux/reducers/qrReducer";

// Root Reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  qr: qrReducer,
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
