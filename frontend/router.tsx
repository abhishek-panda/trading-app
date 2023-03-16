import React from 'react';
import { BrowserRouter, Routes , Route } from 'react-router-dom';
import Home from './pages/Home';
import Error404 from './pages/404';


const AppRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="*" element={<Error404 />} />
			</Routes>
		</BrowserRouter>
	)
};

export default AppRouter;
