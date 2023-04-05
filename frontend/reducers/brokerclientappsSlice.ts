import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BrokenClientRegistation, BrokerClient } from '../../libs/typings'
import request, { REQUEST_METHOD } from '../utils/request';


type BrokerClientInitialState = {
    brokers: string[];
    brokerClientApps: Array<BrokerClient>
}

const initialState: BrokerClientInitialState  = {
    brokers: [],
    brokerClientApps: []
};


const registerBrokerClient = createAsyncThunk('brokerClient/register', (formData: BrokenClientRegistation) => {
    return request('/api/broker-client', REQUEST_METHOD.POST, {}, formData)
        .then(response => response.json());
});

const fetchBrokerClient = createAsyncThunk('brokerClient/fetch', (formData: BrokenClientRegistation) => {
    return request('/api/broker-client', REQUEST_METHOD.GET, {}, {})
        .then(response => response.json());
});

const updateBrokerClient = createAsyncThunk('brokerClient/update', (formData: BrokenClientRegistation) => {
    return request('/api/broker-client', REQUEST_METHOD.PUT, {}, formData)
        .then(response => response.json());
});

const brokerSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        
    }
});

export const brokerReducers = brokerSlice.reducer;
export const brokerActions = brokerSlice.actions;

export  {
    registerBrokerClient,
    fetchBrokerClient,
    updateBrokerClient,
};