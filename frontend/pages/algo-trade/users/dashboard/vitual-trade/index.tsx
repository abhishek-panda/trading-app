import React, { ChangeEvent, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatcher } from "../../../../../store/hooks";
import { TradingTimeFrame } from '../../../../../../libs/typings'
import { getEnumKeys } from '../../../../../../libs/utils';
import { fetchSubscription } from '../../../../../reducers/algoSettingsSlice';
import axios from 'axios';


const VirtualTrade = () => {

	const dispatch = useAppDispatcher();
	const [instrumentName, setInstrumentName] = useState<string>('');
	const [file, setFile] = useState<File>();
	const [selectedSubscription, setSelectedSubscription] = useState<string[]>([]);
	const [selectedTimeframe, setSelectedTimeframe] = useState<string>('');
	let timeFrames = getEnumKeys(TradingTimeFrame);
	const subscriptions = useAppSelector(state => state.algoSettings.subscriptions);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			setFile(files[0]);
		}
	};

	const handleSubscriptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
    	setSelectedSubscription(selectedOptions);
	}

	const handleInstrumentChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInstrumentName(event.target.value);
	}

	const handleTimeframeSeletion = (event: ChangeEvent<HTMLSelectElement>) => {
		setSelectedTimeframe(event.target.value);
	}

	const handleUpload = () => {
		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('subscriptions', selectedSubscription.join(','));
			formData.append('timeframe', selectedTimeframe);
			formData.append('instrumentName', instrumentName);

		
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
		dispatch(fetchSubscription());
	}, []);


	return (
		<>
			<div>Virtual Trade</div>
			<h2>Populate option data by uploading otions data</h2>
			<label htmlFor='timeframe'>Timeframe</label>
			<select id="timeframe" name='timeframe' onChange={handleTimeframeSeletion}>
				<option value="">Select</option>
				{
					//@ts-ignore
					timeFrames.map(tFrame => <option value={TradingTimeFrame[tFrame]} key={TradingTimeFrame[tFrame]}>{tFrame}</option>)
				}
			</select>
			<select id="subscription" name='subscription' onChange={handleSubscriptionChange} multiple>
				{
					//@ts-ignore
					subscriptions.map(subscription => <option value={subscription.id} key={subscription.id}>{subscription.name} |  {subscription.strategyName}</option>)
				}
			</select>
			<input type='text' value={instrumentName} onChange={handleInstrumentChange} placeholder='Get Instrument Name from Zerodha url. And NFO:<insrtumentname> for fno and NSE:<instrumentname> for postional trade' name='instrument_name'></input>
			<input type="file" onChange={handleFileChange} />
      		<button onClick={handleUpload}>Start Trading</button>
		</>
	);
}

export default VirtualTrade;
