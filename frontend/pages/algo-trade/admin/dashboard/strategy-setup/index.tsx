import React, { ChangeEvent, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import axios from 'axios';
import { fetchStrategy } from '../../../../../reducers/adminSlice';


const StrategySetup = () => {

	const dispatch = useAppDispatcher();
	const [callInstrumentName, setCallInstrumentName] = useState<string>('');
	const [putInstrumentName, setPutInstrumentName] = useState<string>('');
	const [callfile, setCallfile] = useState<File>();
	const [putfile, setPutfile] = useState<File>();
	const [selectedStrategy, setSelectedStrategy] = useState<string>('');
	
	let strategies = useAppSelector(state => state.adminData.controls.strategies);

	const callFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			setCallfile(files[0]);
		}
	};

	const putFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			setPutfile(files[0]);
		}
	};

	const handleStrategySeletion = (event: ChangeEvent<HTMLSelectElement>) => {
		setSelectedStrategy(event.target.value);
	}

	const handleCallInstrumentChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCallInstrumentName(event.target.value);
	}

	const handlePutInstrumentChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPutInstrumentName(event.target.value);
	}

	const initTradeSetup = () => {
		if (callfile && putfile && selectedStrategy && callInstrumentName && putInstrumentName) {
			const formData = new FormData();
			formData.append('callfile', callfile);
			formData.append('putfile', putfile);
			formData.append('strategy', selectedStrategy);
			formData.append('callInstrumentName', callInstrumentName);
			formData.append('putInstrumentName', putInstrumentName);

		
			axios.post('/algotm/api/trade/setup', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			})
			.then(response => {
				console.log(response.data);
				// Handle success
			})
			.catch(error => {
				console.error(error);
				// Handle error
			});
		}
		
	};

	useEffect(() => {
		dispatch(fetchStrategy());
	}, []);


	return (
		<>
			<div>Intraday Trade Setup</div>
			<label htmlFor='strategy'>Strategy</label>
			
			<label htmlFor='strategy'>Strategy</label>
			<select id="strategy" name='strategy' onChange={handleStrategySeletion}>
				<option value="">Select</option>
					{strategies.map(strategy => <option value={strategy.sid} key={strategy.sid}>{strategy.name.toUpperCase()}</option>)}
			</select>
			
			<input type='text' value={callInstrumentName} onChange={handleCallInstrumentChange} placeholder='Call Option.Get Instrument Name from Zerodha url. And NFO:<insrtumentname> for fno and NSE:<instrumentname> for postional trade' name='instrument_name'></input>

			<input type='text' value={putInstrumentName} onChange={handlePutInstrumentChange} placeholder='Put Option. Get Instrument Name from Zerodha url. And NFO:<insrtumentname> for fno and NSE:<instrumentname> for postional trade' name='instrument_name'></input>

			<label htmlFor="callFile">Call File</label>
    		<input id="callFile" style={{visibility:'hidden'}} type="file"  onChange={callFileChange}></input>
			<label htmlFor="putFile">Put File</label>
    		<input id="putFile" style={{visibility:'hidden'}} type="file"  onChange={putFileChange}></input>
      		<button onClick={initTradeSetup}>Start Trading</button>


		</>
	);
}

export default StrategySetup;
