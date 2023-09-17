import { configureStore, applyMiddleware } from '@reduxjs/toolkit';
import timerReducer from './timerSlice';
import {
    createStateSyncMiddleware,
    initMessageListener,
  } from "redux-state-sync";

const store = configureStore({
  reducer: {
    timer: timerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createStateSyncMiddleware()),
});

initMessageListener(store)

export default store;


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
