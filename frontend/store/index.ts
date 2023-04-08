import { configureStore } from '@reduxjs/toolkit';
import { cakeReducer } from '../reducers/cakeSlice';
import { userReducers } from '../reducers/userSlice';
import { brokerReducers } from '../reducers/brokerclientappsSlice';
import { adminReducers } from '../reducers/adminSlice';



const store = configureStore({
	reducer: {
		cakeData:cakeReducer,
		userData: userReducers,
		brokerData: brokerReducers,
		adminData: adminReducers,
	}
});


export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
