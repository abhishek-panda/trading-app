import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	noOfCakes: 10
};

const cakeSlice = createSlice({
	name: 'cake',
	initialState,
	reducers: {
		ordered: state => {
			state.noOfCakes--;
		}
	}
});

const cakeReducer = cakeSlice.reducer;
const cakeActions = cakeSlice.actions;

export { cakeReducer, cakeActions}
