import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import userReducer from './userReducer';
import toastReducer from './toastReducer';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
};

// const rootReducer = combineReducers({ booksReducer });

const rootReducer = combineReducers({
    userReducer: persistReducer(persistConfig, userReducer),
    toastReducer: persistReducer(persistConfig, toastReducer)
  });
  
export const store = createStore(rootReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);