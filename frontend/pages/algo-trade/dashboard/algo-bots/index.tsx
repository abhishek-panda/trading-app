import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { useAppSelector, useAppDispatcher } from "../../../../store/hooks";
import { Card, Button, Seperator, Input } from "../../../../components";
import { BrokenClientRegistation, BOOLEAN, BROKER } from '../../../../../libs/typings';
import { registerBrokerClient, fetchBrokerClient } from "../../../../reducers/brokerclientappsSlice";

export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: BrokenClientRegistation = {
	cname: "",
	broker: BROKER.ZERODHA,
	apiKey: "",
};


const AlgoBots = () => {
	const brokers = Object.keys(BROKER);
	const brokerClientApps = useAppSelector(state => state.brokerData.brokerClientApps);
	const dispatch = useAppDispatcher();
	const formik = useFormik({
		initialValues,
		onSubmit: (values) => {
			dispatch(registerBrokerClient(values))
		},
	});

	useEffect(() => {
		dispatch(fetchBrokerClient());
	}, []);

	return (
		<div>
			<form onSubmit={formik.handleSubmit}>
				<InputWrapper>
					<Input
						label="Client Name"
						name="cname"
						type="text"
						value={formik.values.cname}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.cname ? formik.errors.cname : ""}
					/>
				</InputWrapper>

				<InputWrapper>
					<Input
						label="API Key"
						name="apiKey"
						type="text"
						value={formik.values.apiKey}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.apiKey ? formik.errors.apiKey : ""}
					/>
				</InputWrapper>

				<select name='broker' onChange={formik.handleChange} value={formik.values.broker}>
					{brokers.map(broker => <option value={broker} key={broker}>{broker.toUpperCase()}</option>)}
				</select>

				{/* <SignUpBtnWrapper> */}
					<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
						<span>Add</span>
					</Button>
				{/* </SignUpBtnWrapper> */}
			</form>


			<div>
				{brokerClientApps.map(client => {
					return (
						<div>{client.cname}</div>
					)
				})}
			</div>
		</div>
	)
}

export default AlgoBots;
