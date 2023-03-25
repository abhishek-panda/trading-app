import React from 'react';
import { BrowserRouter as Router, Routes , Route, NavLink } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';
import Blog from './pages/Blog'
import Error404 from './pages/404';
import AlgoTrade from './pages/AlgoTrade'
import Login from './pages/AlgoTrade/Login';
import Register from './pages/AlgoTrade/Register';
import Dashboard from './pages/AlgoTrade/Dashboard';
import Home from './pages/AlgoTrade/Dashboard/Home';
import ActiveOrders from './pages/AlgoTrade/Dashboard/ActiveOrders';
import RequiredAuth from './utils/RequiredAuth';
import { AuthProvider } from './utils/contexts/auth';

const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<ComingSoon />} />
				<Route index element={<ComingSoon />} />
				<Route path='blog' element={<Blog />}/>
				<Route path='algotm' element={<AuthProvider><AlgoTrade /></AuthProvider>}>
					<Route index element={<Login />} />
					<Route path='login' element={<Login />} />
					<Route path='register' element={<Register />} />
					<Route path='dashboard' element={<RequiredAuth><Dashboard /></RequiredAuth>}>
						<Route index element={<Home />} />
						<Route path='home' element={<Home />} />
						<Route path='active-orders' element={<ActiveOrders />} />
					</Route>
				</Route>
				<Route path='*' element={<Error404 /> } />
			</Routes>
		</Router>
	)
};

export default AppRouter;
