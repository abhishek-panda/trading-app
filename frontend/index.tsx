import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';


const container = document.getElementById('app-shell');
if (container) {
	const creatRoot = ReactDOM.createRoot(container);
	creatRoot.render(<App />);
}

