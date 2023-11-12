import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IStrategy, IResponse } from '../../libs/typings'
import request, { REQUEST_METHOD } from '../utils/request';


type AdminInitialState = {
    controls: {
        strategies: IStrategy[]
    };
}

const initialState: AdminInitialState = {
    controls: {
        strategies: []
    },
};


const registerStrategy = createAsyncThunk('strategy/register', async (data: FormData) => {
    const response = await request('/algotm/api/strategy', REQUEST_METHOD.POST, {}, data);
    return await response.json();
});

const updateStrategy = createAsyncThunk('strategy/update', async (data: FormData) => {
    const response = await request('/algotm/api/strategy', REQUEST_METHOD.PUT, {}, data);
    return await response.json();
});

const fetchStrategy = createAsyncThunk('strategy/fetch', _ => {
    return request('/algotm/api/strategy', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});


const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(registerStrategy.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.controls.strategies.unshift(action.payload.data);
        });
        builder.addCase(fetchStrategy.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.controls.strategies = action.payload.data;
        });
        builder.addCase(fetchStrategy.rejected, (state, action) => {
            state.controls.strategies = [];
        });
    }
});

export const adminReducers = adminSlice.reducer;
export const adminActions = adminSlice.actions;

export {
    registerStrategy,
    fetchStrategy,
    updateStrategy,
};