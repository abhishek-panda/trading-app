import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BrokenClientRegistation, IBrokerClient, IResponse, ISubscription, ISubscriptionData } from '../../libs/typings'
import request, { REQUEST_METHOD } from '../utils/request';


type BrokerClientInitialState = {
    validateClient: {
        loading: boolean;
        error: string;
        message: string;
    };
    brokerClientApps: Array<IBrokerClient>
    subscriptions: Array<ISubscriptionData>
}

const initialState: BrokerClientInitialState = {
    validateClient: {
        loading: false,
        error: '',
        message: ''
    },
    brokerClientApps: [],
    subscriptions: []
};


const registerBrokerClient = createAsyncThunk('brokerClient/register', (formData: BrokenClientRegistation) => {
    return request('/algotm/api/broker-client', REQUEST_METHOD.POST, {}, formData)
        .then(response => response.json());
});

const fetchBrokerClient = createAsyncThunk('brokerClient/fetch', _ => {
    return request('/algotm/api/broker-client', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});

const updateBrokerClient = createAsyncThunk('brokerClient/update', (data: Record<string, any>) => {
    return request('/algotm/api/broker-client', REQUEST_METHOD.PUT, {}, data)
        .then(response => response.json());
});

const registerSubscription = createAsyncThunk('subscription/register', (data: ISubscription) => {
    return request('/algotm/api/subscription', REQUEST_METHOD.POST, {}, data)
        .then(response => response.json());
});

const fetchSubscription = createAsyncThunk('subscription/fetch', _ => {
    return request('/algotm/api/subscription', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});

const updateSubscription = createAsyncThunk('subscription/update', (data: Record<string, any>) => {
    return request('/algotm/api/subscription', REQUEST_METHOD.PUT, {}, data)
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
        builder.addCase(updateBrokerClient.pending, (state, action) => {
            state.validateClient.loading = true;
            state.validateClient.error = '';
            state.validateClient.message = '';
        });
        builder.addCase(updateBrokerClient.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.validateClient.loading = false;
            state.validateClient.error = '';
            state.validateClient.message = action.payload.message ?? '';
            state.brokerClientApps = state.brokerClientApps.map(client => {
                return client.id === action.payload.data.id ? action.payload.data : client;
            });
        });
        builder.addCase(updateBrokerClient.rejected, (state, action) => {
            state.validateClient.loading = false;
            state.validateClient.error = action.error.message ?? '';
            state.validateClient.message = '';
        });

        builder.addCase(registerSubscription.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.subscriptions.unshift(action.payload.data);
        });
        builder.addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<IResponse>) => {
            state.subscriptions = action.payload.data;
        });
        builder.addCase(fetchSubscription.rejected, (state, action) => {
            state.subscriptions = [];
        });

        builder.addCase(updateSubscription.fulfilled, (state, action) => {
            state.subscriptions = state.subscriptions.map(subscrition => {
                return (
                    subscrition.brokerClientId === action.payload.data.brokerClientId &&
                    subscrition.strategyId === action.payload.data.strategyId &&
                    subscrition.timeframe === action.payload.data.timeframe
                ) ? action.payload.data : subscrition;
            });
        });
    }
});

export const algoSettingsReducers = algoSettingsSlice.reducer;
export const algoSettingsActions = algoSettingsSlice.actions;

export {
    registerBrokerClient,
    fetchBrokerClient,
    updateBrokerClient,
    registerSubscription,
    fetchSubscription,
    updateSubscription
};