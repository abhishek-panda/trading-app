import { createSlice, createAsyncThunk, PayloadAction }  from '@reduxjs/toolkit';
import axios from 'axios';
import { User, UserRegistrationInputs } from "../../libs/typings";

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
	return axios.get('/api/user')
		.then(response => response.data);
});

const registerUser  = createAsyncThunk('user/register', (formData: UserRegistrationInputs) => {
	return axios.post('/api/user/register', JSON.stringify(formData), {
		headers: {
			'Content-Type': 'application/json'
		}
	})
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
		builder.addCase(registerUser.pending, (state, action ) => {
			state.loading= true;
			state.user = undefined;
			state.error = '';
		});
		builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
			state.loading = false;
			state.user = action.payload;
			state.error = '';
			// state.hasFetched = true;
		});
		builder.addCase(registerUser.rejected, (state, action ) => {
			state.loading= false;
			state.user = undefined;
			state.error = action.error.message ?? '';
			// state.hasFetched = true;
		});
	}
});

export const  userReducers = userSlice.reducer;
export const fetchUserAction = userSlice.actions;

export {
	fetchUser,
	registerUser
};

