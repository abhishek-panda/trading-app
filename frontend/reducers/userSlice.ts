import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRegistrationInputs, IResponse } from "../../libs/typings";
import request, { REQUEST_METHOD } from '../utils/request';


type UserInitialState = {
	loading: boolean;
	user: User | undefined;
	error: string;
	hasFetched: boolean;
	registeration?: IResponse
}


const initialState: UserInitialState = {
	loading: false,
	user: undefined,
	error: '',
	hasFetched: false,
}

const fetchUser = createAsyncThunk('user/fetch', () => {
	return request('/api/user', REQUEST_METHOD.GET, {}, {}, false )
		.then(response => response.json());
});

const registerUser = createAsyncThunk('user/register', (formData: UserRegistrationInputs) => {
	return request('/api/user/register', REQUEST_METHOD.POST, {}, formData)
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
		builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
			state.loading = false;
			state.user = action.payload;
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
			state.registeration = {
				message: action.payload.message
			};
		});
		builder.addCase(registerUser.rejected, (state, action) => {
			state.registeration = {
				message: action.error.message ?? ""
			};
		});
	}
});

export const userReducers = userSlice.reducer;
export const fetchUserAction = userSlice.actions;

export {
	fetchUser,
	registerUser
};

