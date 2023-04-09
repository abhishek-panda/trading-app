import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { Button, Input } from "../../../../../components";
import { BOOLEAN, BrokenClientRegistation, BROKER, IBrokerClient } from '../../../../../../libs/typings';
import { registerBrokerClient, fetchBrokerClient, updateBrokerClient } from "../../../../../reducers/algoSettingsSlice";
import { validBrokerClientSchema } from '../../../../../../libs/utils';
import Switch from '@mui/material/Switch';



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
	const brokerClientApps = useAppSelector(state => state.algoSettings.brokerClientApps);
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
		const redirectParams = encodeURIComponent(`cid=${client.id}&type=validate`)
		window.open(`https://kite.zerodha.com/connect/login?v=3&api_key=${client.apiKey}&redirect_params=${redirectParams}`, "_blank", "width=900,height=900");
	}

	const toggleClient = (client: IBrokerClient) => {
		const isEnabled =  client.isEnabled === BOOLEAN.TRUE ? true: false;
		if (isEnabled) {
			const agreeMsg = 'I UNDERSTAND';
			let promptMsg = prompt(`CAUTION: Deactivating client will stop execution of any existing trades. Make sure to close all trades before deactivating client. Type '${agreeMsg}' to continue`);
			if (promptMsg !== agreeMsg) return; 
		}
		const payload = {
			cid: client.id,
			type: 'update',
			status: (!isEnabled).toString(),
		};
		dispatch(updateBrokerClient(payload))
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
					<option value="">Select</option>
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
					const isEnabled =  client.isEnabled === BOOLEAN.TRUE ? true: false;
					const isActive = client.isActive === BOOLEAN.TRUE ? true: false;
					return (
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span>{client.cname}</span>
							<Switch checked={isEnabled} onChange={_ => toggleClient(client)} color='secondary'/>
							<button disabled={isActive} onClick={_ => validateClient(client)}>Activate</button>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default AlgoBots;
