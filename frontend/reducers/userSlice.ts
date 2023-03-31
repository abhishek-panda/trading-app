import { createSlice, createAsyncThunk, PayloadAction }  from '@reduxjs/toolkit';
import axios from 'axios';
import { User, UserRegistrationInputs, StandardResponse } from "../../libs/typings";
import { API_REQUEST_STATE } from '../typings/typings'


interface ResgistrationResponse extends StandardResponse {
	state: API_REQUEST_STATE
}

type UserInitialState = {
	loading: boolean;
	user: User | undefined;
	error: string;
	hasFetched: boolean;
	registeration?: ResgistrationResponse
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
	return fetch('/api/user/register', {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(formData)
	})
	.then(async response => {
		if (!response.ok) {
			const data = await response.json();
			const message = Object.keys(data.error).reduce((accumulator, key) => {
				accumulator += data.error[key]
				return accumulator;
			},'');
			throw new Error(message);
		}
		return response.json();
	})
	.then(data => data);
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
		builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<StandardResponse>) => {
			state.registeration = {
				state: API_REQUEST_STATE.SUCCESS,
				message: action.payload.message
			};
		});
		builder.addCase(registerUser.rejected, (state,  action) => {
			state.registeration = {
				state: API_REQUEST_STATE.FAILURE,
				message: action.error.message ?? ""
			};
		});
	}
});

export const  userReducers = userSlice.reducer;
export const fetchUserAction = userSlice.actions;

export {
	fetchUser,
	registerUser
};

