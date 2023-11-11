import React, { useEffect, useState} from "react";
import styled from 'styled-components';
import { useFormik } from 'formik';
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { IStrategy, TradingTimeFrame } from '../../../../../../libs/typings'
import { Card, Button, Input } from "../../../../../components";
import { validStrategySchema } from '../../../../../../libs/utils';
import { registerStrategy, fetchStrategy } from "../../../../../reducers/adminSlice";
import { validSubscriptionSchema, getEnumKeys } from '../../../../../../libs/utils';
import axios from 'axios';


export const InputWrapper = styled.div`
	margin: 8px 0;
`;


const initialValues: IStrategy = {
	sid: "",
	name: "",
	description: "",
	timeframe: "",
	callInstrumentName: "",
	putInstrumentName: ""
};

const Controls = () => {

	const controls = useAppSelector(state => state.adminData.controls);
	const [callfile, setCallfile] = useState<File>();
	const [putfile, setPutfile] = useState<File>();
	const dispatch = useAppDispatcher();

	const formik = useFormik({
		initialValues,
		validationSchema: validStrategySchema,
		onSubmit: (values, { resetForm }) => {
			if (callfile && putfile) {

				const fd = new FormData();
				for (const key in values) {
					//@ts-ignore
					fd.append(key, values[key]);
				}
				fd.append('callfile', callfile);
				fd.append('putfile', putfile);
				dispatch(registerStrategy(fd));
				resetForm();
			}
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
					<Input
						label="Call Option"
						name='callInstrumentName'
						type='text'
						value={formik.values.callInstrumentName} onChange={formik.handleChange} placeholder='Call Option.Get Instrument Name from Zerodha url. And NFO:<insrtumentname> for fno and NSE:<instrumentname> for postional trade'
						error={formik.touched.callInstrumentName ? formik.errors.callInstrumentName : ""}
					/>
				</InputWrapper>
				
				<InputWrapper>
					<Input
						label="Put Option"
						name='putInstrumentName'
						type='text'
						value={formik.values.putInstrumentName}
						onChange={formik.handleChange}
						placeholder='Put Option. Get Instrument Name from Zerodha url. And NFO:<insrtumentname> for fno and NSE:<instrumentname> for postional trade'
						error={formik.touched.putInstrumentName ? formik.errors.putInstrumentName : ""}
					/>
				</InputWrapper>
				<InputWrapper>
					<Input
						label="Call File"
						name='callFile'
						type='file'
						//@ts-ignore
						value={formik.values.callFile}
						onChange={(event) => {
							const files = event.currentTarget.files;
							if (files) {
								setCallfile(files[0]);
							}
						}}
						//@ts-ignore
						error={formik.touched.callFile ? formik.errors.callFile : ""}
					/>
				</InputWrapper>
				<InputWrapper>
					<Input
						label="Put File"
						name='putFile'
						type='file'
						//@ts-ignore
						value={formik.values.putFile}
						onChange={(event) => {
							const files = event.currentTarget.files;
							if (files) {
								setPutfile(files[0]);
							}
						}}
						//@ts-ignore
						error={formik.touched.putFile ? formik.errors.putFile : ""}
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
