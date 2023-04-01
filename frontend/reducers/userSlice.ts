import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRegistrationInputs, UserLoginInputs, IResponse } from "../../libs/typings";
import request, { REQUEST_METHOD } from '../utils/request';


type UserInitialState = {
	loading: boolean;
	user: User | undefined;
	error: string;
	hasFetched: boolean;
	registration?: IResponse
}


const initialState: UserInitialState = {
	loading: false,
	user: undefined,
	error: '',
	hasFetched: false,
}

const fetchUser = createAsyncThunk('user/fetch', _ => {
	return request('/api/user', REQUEST_METHOD.GET, {}, {}, false )
		.then(response => response.json())
});

const registerUser = createAsyncThunk('user/register', (formData: UserRegistrationInputs) => {
	return request('/api/user/register', REQUEST_METHOD.POST, {}, formData)
		.then(response => response.json());
});

const loginUser = createAsyncThunk('user/login', (formData: UserLoginInputs) => {
	return request('/api/user/login', REQUEST_METHOD.POST, {}, formData)
		.then(response => response.json());
});

const logoutUser = createAsyncThunk('user/logout', _ => {
	return request('/api/user/logout', REQUEST_METHOD.GET, {})
		.then(response => response.json());
});

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchUser.pending, state => {
			state.loading = true;
			state.user = undefined;
			state.error = '';
			state.hasFetched = true;
		});
		builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<IResponse>) => {
			state.loading = false;
			state.user = action.payload.data;
			state.error = '';
			state.hasFetched = true;
		});
		builder.addCase(fetchUser.rejected, (state, action) => {
			state.loading = false;
			state.user = undefined;
			state.error = action.error.message ?? '';
			state.hasFetched = true;
		});
		builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<IResponse>) => {
			state.registration = {
				message: action.payload.message
			};
		});
		builder.addCase(registerUser.rejected, (state, action) => {
			state.registration = {
				message: action.error.message ?? ""
			};
		});
		builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<IResponse>) => {
			state.user = action.payload.data;
			state.error = '';
		});
		builder.addCase(loginUser.rejected, (state, action) => {
			state.user = undefined;
			state.error = action.error.message ?? '';
		});
		builder.addCase(logoutUser.fulfilled, (state, action: PayloadAction<IResponse>) => {
			state.user = undefined;
			state.error = '';
		});
		builder.addCase(logoutUser.rejected, (state, action) => {
			state.error = action.error.message ?? '';
		});
	}
});

export const userReducers = userSlice.reducer;
export const userActions = userSlice.actions;

export {
	fetchUser,
	registerUser,
	loginUser,
	logoutUser
};

