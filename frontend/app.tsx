import './app.css';
import "react-toastify/dist/ReactToastify.css";
import React from 'react';
import { Provider as AppStateProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import AppRouter from './router';
import store from './store';


const App = () => {
	return (
		<AppStateProvider store={store}>
			<AppRouter />
			<ToastContainer />
		</AppStateProvider>
	);
};

export default App;
