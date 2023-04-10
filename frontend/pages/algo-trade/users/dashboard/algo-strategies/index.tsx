import React, {useEffect} from 'react';
import styled from 'styled-components';
import { useFormik } from 'formik';
import { fetchStrategy } from "../../../../../reducers/adminSlice";
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { fetchBrokerClient, registerSubscription, fetchSubscription } from '../../../../../reducers/algoSettingsSlice';
import { BOOLEAN, ISubscription, TradingTimeFrame } from '../../../../../../libs/typings'
import { validSubscriptionSchema, getEnumKeys } from '../../../../../../libs/utils';
import { Button, Input } from "../../../../../components";

export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: ISubscription = {
	name: "",
	brokerClient: "",
	strategy: "",
	timeframe: ""
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

	let timeFrames = getEnumKeys(TradingTimeFrame);

	useEffect(() => {
		dispatch(fetchBrokerClient());
		dispatch(fetchStrategy());
		dispatch(fetchSubscription());
	}, []);


	

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
						<select id="broker-client" name='brokerClient' onChange={formik.handleChange} value={formik.values.brokerClient} onBlur={formik.handleBlur}>
							<option value="">Select</option>
							{brokerClients.map(brokerClient => <option value={brokerClient.id} key={brokerClient.id}>{brokerClient.cname.toUpperCase()}</option>)}
						</select>
						{formik.touched.brokerClient ? <span>{formik.errors.brokerClient}</span> : undefined}
					</InputWrapper>

					<InputWrapper>
						<label htmlFor='strategy'>Strategy</label>
						<select id="strategy" name='strategy' onChange={formik.handleChange} value={formik.values.strategy} onBlur={formik.handleBlur}>
							<option value="">Select</option>
							{strategies.map(strategy => <option value={strategy.sid} key={strategy.sid}>{strategy.name.toUpperCase()}</option>)}
						</select>
						{formik.touched.strategy ? <span>{formik.errors.strategy}</span> : undefined}
					</InputWrapper>
					
					<InputWrapper>
						<label htmlFor='timeframe'>Timeframe</label>
						<select id="timeframe" name='timeframe' onChange={formik.handleChange} value={formik.values.timeframe} onBlur={formik.handleBlur}>
							<option value="">Select</option>
							{
								//@ts-ignore
								timeFrames.map(tFrame => <option value={TradingTimeFrame[tFrame]} key={TradingTimeFrame[tFrame]}>{tFrame}</option>)
							}
						</select>
						{formik.touched.timeframe ? <span>{formik.errors.timeframe}</span> : undefined}
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
						return (
							<div style={{ display: 'flex', justifyContent: 'space-between'}}>
								<span>{subscription.name}</span>
								<span>{subscription.brokerClientName}</span>
								<span>{subscription.strategyName}</span>
								<span>{subscription.timeframe}</span>
							</div>
						)
					})
				}
			</section>
		</>
	)
}

export default AlgoStrategies;
