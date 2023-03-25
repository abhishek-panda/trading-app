import { configureStore } from '@reduxjs/toolkit';
import { cakeReducer } from '../reducers/cakeSlice';
import { userReducers } from '../reducers/userSlice';



const store = configureStore({
	reducer: {
		cakeData:cakeReducer,
		userData: userReducers
	}
});


export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
