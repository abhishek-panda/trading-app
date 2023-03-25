import { createSlice, createAsyncThunk, PayloadAction }  from '@reduxjs/toolkit';
import axios from 'axios';
import { User } from '../models'


type UserInitialState = {
	loading: boolean;
	user: User | undefined;
	error: string;
	hasFetched: boolean;
}


const initialState: UserInitialState = {
	loading: false,
	user: undefined,
	error: '',
	hasFetched: false,
}

const fetchUser = createAsyncThunk('user/fetch', () => {
	return axios.get('https://jsonplaceholder.typicode.com/uses/1')
		.then(response => response.data);
});

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {},
	extraReducers: (builder)=> {
		builder.addCase(fetchUser.pending, state => {
			state.loading = true;
			state.user = undefined;
			state.error = '';
			state.hasFetched = true;
		});
		builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
			state.loading = false;
			state.user = action.payload;
			state.error = '';
			state.hasFetched = true;
		});
		builder.addCase(fetchUser.rejected, (state, action ) => {
			state.loading= false;
			state.user = undefined;
			state.error = action.error.message ?? '';
			state.hasFetched = true;
		});
	}
});

export const  userReducers = userSlice.reducer;
export const fetchUserAction = userSlice.actions;

export default fetchUser;

