import React, { useEffect} from "react";
import styled from 'styled-components';
import { useFormik } from 'formik';
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { IStrategy, TradingTimeFrame } from '../../../../../../libs/typings'
import { Card, Button, Input } from "../../../../../components";
import { validStrategySchema } from '../../../../../../libs/utils';
import { registerStrategy, fetchStrategy } from "../../../../../reducers/adminSlice";
import { validSubscriptionSchema, getEnumKeys } from '../../../../../../libs/utils';

export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: IStrategy = {
	sid: "",
	name: "",
	description: "",
	timeframe: ""
};

const Controls = () => {

	const controls = useAppSelector(state => state.adminData.controls);
	const dispatch = useAppDispatcher();

	const formik = useFormik({
		initialValues,
		validationSchema: validStrategySchema,
		onSubmit: (values, { resetForm }) => {
			dispatch(registerStrategy(values));
			resetForm();
		},
	});

	let timeFrames = getEnumKeys(TradingTimeFrame);

	useEffect(() => {
		dispatch(fetchStrategy());
	}, []);

	return (
		<section>
			<h3>Stategies</h3>
			<form onSubmit={formik.handleSubmit}>
			<InputWrapper>
					<Input
						label="Strategy ID"
						name="sid"
						type="text"
						value={formik.values.sid}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.sid ? formik.errors.sid : ""}
					/>
				</InputWrapper>

				<InputWrapper>
					<Input
						label="Strategy Name"
						name="name"
						type="text"
						value={formik.values.name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.name ? formik.errors.name : ""}
					/>
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

				<InputWrapper>
					<Input
						label="Description"
						name="description"
						type="text"
						value={formik.values.description}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						error={formik.touched.description ? formik.errors.description : ""}
					/>
				</InputWrapper>
				<InputWrapper>
					<Button buttonColor="rgb(103, 58, 183)" hasBorder={false}>
						<span>Add</span>
					</Button>
				</InputWrapper>
			</form>

			<div style={{ marginTop: '30px' }}>
				<h4>Strategies</h4>
				<hr/>
				{controls.strategies.map(strategy => {
					return (
						<div style={{ display: 'flex', justifyContent: 'space-between' }} >
							<div style={{ display: 'flex', justifyContent: "flex-start" }}>
								<span>{strategy.name}</span>
							</div>
							<div><span>{strategy.timeframe}</span></div>
							<div><span>{strategy.description}</span></div>
						</div>
					)
				})}
			</div>
		</section>
	);
};

export default Controls;
