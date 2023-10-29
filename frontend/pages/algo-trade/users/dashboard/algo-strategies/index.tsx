import React, {useEffect} from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { fetchStrategy } from "../../../../../reducers/adminSlice";
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { fetchBrokerClient, registerSubscription, fetchSubscription, updateSubscription } from '../../../../../reducers/algoSettingsSlice';
import { BOOLEAN, ISubscription, ISubscriptionData, TradingTimeFrame } from '../../../../../../libs/typings'
import { validSubscriptionSchema, getEnumKeys } from '../../../../../../libs/utils';
import { Button, Input } from "../../../../../components";
import Switch from '@mui/material/Switch';


export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: ISubscription = {
	name: "",
	brokerClientId: "",
	strategyId: "",
};


const AlgoStrategies = () => {
	
	const dispatch = useAppDispatcher();
	let strategies = useAppSelector(state => state.adminData.controls.strategies);
	let brokerClients = useAppSelector(state => state.algoSettings.brokerClientApps.filter(client => client.isEnabled === BOOLEAN.TRUE));
	const subscriptions = useAppSelector(state => state.algoSettings.subscriptions);
	
	const formik = useFormik({
		initialValues,
		validationSchema: validSubscriptionSchema,
		onSubmit: (values, { resetForm }) => {
			dispatch(registerSubscription(values))
			resetForm();
		},
	});

	useEffect(() => {
		dispatch(fetchBrokerClient());
		dispatch(fetchStrategy());
		dispatch(fetchSubscription());
	}, []);

	const toggleSubscription = (subscription: ISubscriptionData, toUpdate: string) => {
		const isActive = BOOLEAN.TRUE === subscription.isActive ? true : false;
		const testMode = BOOLEAN.TRUE === subscription.testMode ? true : false;

		if (toUpdate === 'status' && isActive) {
			const agreeMsg = 'I UNDERSTAND';
			let promptMsg = prompt(`CAUTION: Deactivating subscription will stop execution of any existing trades. Make sure to close all trades before deactivating client. Type '${agreeMsg}' to continue`);
			if (promptMsg !== agreeMsg) return;
		}

		if (toUpdate === 'mode' && testMode) {
			const agreeMsg = 'I UNDERSTAND';
			let promptMsg = prompt(`CAUTION: This will stop all virtual trade and initiate real trade on right time. Type '${agreeMsg}' to continue`);
			if (promptMsg !== agreeMsg) return;
		}



		const payload = {
			brokerClientId: subscription.brokerClientId,
			strategyId: subscription.strategyId,
			isActive: toUpdate === 'status' ? (!isActive).toString() : subscription.isActive,
			testMode: toUpdate === 'mode' ? (!testMode).toString() : subscription.testMode
		}
		dispatch(updateSubscription(payload));
	} 
	

	return (
		<>
			<section>
				<h3>Strategies</h3>
				<hr/>
				{strategies.map(strategy => {
					return (
						<div>
							<span>{strategy.name}</span>
							<p>{strategy.description}</p>
						</div>
					);
				})}
			</section>

			<section>
				<h3>Subscription</h3>
				<hr/>
				<form onSubmit={formik.handleSubmit}>
					<InputWrapper>
						<Input
							label="Subscription Name"
							name="name"
							type="text"
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.name ? formik.errors.name : ""}
						/>
					</InputWrapper>

					<InputWrapper>
						<label htmlFor='broker-client'>Broker Client</label>
						<select id="broker-client" name='brokerClientId' onChange={formik.handleChange} value={formik.values.brokerClientId} onBlur={formik.handleBlur}>
							<option value="">Select</option>
							{brokerClients.map(brokerClient => <option value={brokerClient.id} key={brokerClient.id}>{brokerClient.cname.toUpperCase()}</option>)}
						</select>
						{formik.touched.brokerClientId ? <span>{formik.errors.brokerClientId}</span> : undefined}
					</InputWrapper>

					<InputWrapper>
						<label htmlFor='strategy'>Strategy</label>
						<select id="strategy" name='strategyId' onChange={formik.handleChange} value={formik.values.strategyId} onBlur={formik.handleBlur}>
							<option value="">Select</option>
							{strategies.map(strategy => <option value={strategy.sid} key={strategy.sid}>{strategy.name.toUpperCase()}</option>)}
						</select>
						{formik.touched.strategyId ? <span>{formik.errors.strategyId}</span> : undefined}
					</InputWrapper>

					<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
						<span>Subscribe</span>
					</Button>
				</form>
			</section>

			<section style={{ marginTop: '30px' }}>
				<h4>Subscriptions</h4>

				{
					subscriptions.map(subscription => {
						const isActive = BOOLEAN.TRUE === subscription.isActive ? true : false;
						const testMode = BOOLEAN.TRUE === subscription.testMode ? true : false;
						console.log(subscription)
						return (
							<div style={{ display: 'flex', justifyContent: 'space-between'}}>
								<span>{subscription.name}</span>
								<span>{subscription.brokerClientName}</span>
								<span>{subscription.strategyName}</span>
								<div>
									<label htmlFor={`${subscription.brokerClientId}_${subscription.strategyId}`}>Enable</label>
									<Switch id={`${subscription.brokerClientId}_${subscription.strategyId}`} checked={isActive} onChange={ () => toggleSubscription(subscription, 'status')} color='secondary'/>
								</div>
								<div>
									<label htmlFor={`${subscription.brokerClientId}_${subscription.strategyId}`}>Deploy</label>
									<Switch id={`${subscription.brokerClientId}_${subscription.strategyId}`} checked={testMode} onChange={ () => toggleSubscription(subscription, 'mode')} color='secondary'/>
									<label htmlFor={`${subscription.brokerClientId}_${subscription.strategyId}`}>Test</label>
								</div>
							</div>
						)
					})
				}
			</section>
		</>
	)
}

export default AlgoStrategies;
