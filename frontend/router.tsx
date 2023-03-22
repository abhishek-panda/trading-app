import React from 'react';
import { BrowserRouter as Router, Routes , Route, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Error404 from './pages/404';
import ActiveOrders from './pages/ActiveOrders';

const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route index element={<Login />} />
				<Route path="/" element={<Login />} />
				<Route path='login' element={<Login />} />
				<Route path='register' element={<Register />} />
				<Route path='dashboard' element={<Dashboard />}>
					<Route index element={<Home />} />
					<Route path='home' element={<Home />} />
					<Route path='active-orders' element={<ActiveOrders />} />
				</Route>
				<Route path='*' element={<Error404 /> } />
			</Routes>
		</Router>
	)
};

export default AppRouter;
