import React from 'react';
import { createGlobalStyle } from 'styled-components';
import "react-toastify/dist/ReactToastify.css";
import { Provider as AppStateProvider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import AppRouter from './router';
import store from './store';


const GlobalStyle = createGlobalStyle`
	@import url('https://fonts.googleapis.com/css?family=Montserrat:400,600,700');
	@import url('https://fonts.googleapis.com/css?family=Roboto:400,800');

	* {
		margin: 0;
		padding: 0;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
	}

	:root {
		--font-family: "Roboto" ,sans-serif;
		--yellow: hsl(45, 100%, 50%);
		--charcoal: hsl(0, 0%, 25%);
		--grey:hsl(210, 31%, 95%);
		--white: hsl(0, 0%, 100%);
		--theme-highlight-color: var(--yellow);
		--theme-text-color: var(--charcoal);
		--theme-background-color: var(--grey);
		--pure-material-primary-rgb: 255, 191, 0;
		--pure-material-onsurface-rgb: 0, 0, 0;
	}

	#app-shell {
		height: 100vh;
		font-family: var(--font-family);
		overflow: hidden;
		color: var(--theme-text-color);
		background-color: var(--theme-background-color);
	}
`;

const App = () => {
	return (
		<AppStateProvider store={store}>
			<GlobalStyle />
			<AppRouter />
			<ToastContainer />
		</AppStateProvider>
	);
};

export default App;
