import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { useAppSelector, useAppDispatcher } from "../../../../store/hooks";
import { Card, Button, Input } from "../../../../components";
import { BOOLEAN, BrokenClientRegistation, BROKER, IBrokerClient } from '../../../../../libs/typings';
import { registerBrokerClient, fetchBrokerClient } from "../../../../reducers/brokerclientappsSlice";
import { validBrokerClientSchema } from '../../../../../libs/utils';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';


export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: BrokenClientRegistation = {
	cname: "",
	broker: BROKER.ZERODHA,
	apiKey: "",
	secret: ""
};


const AlgoBots = () => {
	const brokers = Object.keys(BROKER);
	const brokerClientApps = useAppSelector(state => state.brokerData.brokerClientApps);
	const dispatch = useAppDispatcher();
	const formik = useFormik({
		initialValues,
		validationSchema: validBrokerClientSchema,
		onSubmit: (values) => {
			dispatch(registerBrokerClient(values))
		},
	});

	useEffect(() => {
		dispatch(fetchBrokerClient());
	}, []);

	const validateClient = (client: IBrokerClient) => {
		const redirectParams = encodeURIComponent(`cid=${client.id}`)
		window.open(`https://kite.zerodha.com/connect/login?v=3&api_key=${client.apiKey}&redirect_params=${redirectParams}`, "_blank", "width=900,height=900");
	}

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

				<InputWrapper>
					<Input
						label="Secret"
						name="secret"
						type="text"
						value={formik.values.secret}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.secret ? formik.errors.secret : ""}
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

			<div style={{ marginTop: '30px' }}>
				<h4>Client Apps</h4>
				<hr/>
				{brokerClientApps.map(client => {
					const disabled = client.isActive === BOOLEAN.TRUE ? true: false;
					return (
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span>{client.cname}</span>
							<button disabled={disabled} onClick={() => validateClient(client)}>Activate</button>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default AlgoBots;
