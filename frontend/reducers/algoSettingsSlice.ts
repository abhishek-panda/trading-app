import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BrokenClientRegistation, IBrokerClient, IResponse, ISubscription } from '../../libs/typings'
import request, { REQUEST_METHOD } from '../utils/request';


type BrokerClientInitialState = {
    validateClient: {
        loading: boolean;
        error: string;
        message: string;
    };
    brokerClientApps: Array<IBrokerClient>
    subscriptions: Array<ISubscription>
}

const initialState: BrokerClientInitialState  = {
    validateClient: {
        loading: false,
        error: '',
        message: ''
    },
    brokerClientApps: [],
    subscriptions: []
};


const registerBrokerClient = createAsyncThunk('brokerClient/register', (formData: BrokenClientRegistation) => {
    return request('/api/broker-client', REQUEST_METHOD.POST, {}, formData)
        .then(response => response.json());
});

const fetchBrokerClient = createAsyncThunk('brokerClient/fetch', _ => {
    return request('/api/broker-client', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});

const updateBrokerClient = createAsyncThunk('brokerClient/update', (data: BrokenClientRegistation) => {
    return request('/api/broker-client', REQUEST_METHOD.PUT, {}, data)
        .then(response => response.json());
});

const validateBrokerClient = createAsyncThunk('brokerClient/validate', (data: Record<string, any>) => {
    return request('/api/broker-client', REQUEST_METHOD.PUT, {}, data)
        .then(response => response.json());
});

const registerSubscription = createAsyncThunk('subscription/register', (data: ISubscription) => {
    return request('/api/subscription', REQUEST_METHOD.POST, {}, data)
        .then(response => response.json());
});

const fetchSubscription = createAsyncThunk('subscription/fetch', _ => {
    return request('/api/subscription', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});

const updateSubscription = createAsyncThunk('subscription/register', (data: ISubscription) => {
    return request('/api/subscription', REQUEST_METHOD.PUT, {}, data)
        .then(response => response.json());
});

const algoSettingsSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(registerBrokerClient.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.brokerClientApps.unshift(action.payload.data);
		});
        builder.addCase(fetchBrokerClient.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.brokerClientApps = action.payload.data;
		});
        builder.addCase(fetchBrokerClient.rejected, (state, action) => {
            state.brokerClientApps = [];
		});
        builder.addCase(validateBrokerClient.pending, (state, action) => {
            state.validateClient.loading = true;
            state.validateClient.error = '';
            state.validateClient.message = '';
		});
        builder.addCase(validateBrokerClient.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.validateClient.loading = false;
            state.validateClient.error = '';
            state.validateClient.message = action.payload.message ?? '';
		});
        builder.addCase(validateBrokerClient.rejected, (state, action) => {
            state.validateClient.loading = false;
            state.validateClient.error =  action.error.message ?? '';
            state.validateClient.message = '';
		});
    }
});

export const algoSettingsReducers = algoSettingsSlice.reducer;
export const algoSettingsActions = algoSettingsSlice.actions;

export  {
    registerBrokerClient,
    fetchBrokerClient,
    updateBrokerClient,
    validateBrokerClient,
    registerSubscription,
    fetchSubscription,
    updateSubscription
};