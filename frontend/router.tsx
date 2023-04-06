import React from 'react';
import { BrowserRouter as Router, Routes , Route, NavLink } from 'react-router-dom';
import ComingSoon from './pages/coming-soon';
import Blog from './pages/blog'
import Error404 from './pages/404';
import AlgoTrade from './pages/algo-trade'
import Login from './pages/algo-trade/login';
import Register from './pages/algo-trade/register';
import ValidateClient from './pages/algo-trade/validate-client';
import Dashboard from './pages/algo-trade/dashboard';
import Home from './pages/algo-trade/dashboard/home';
import ActiveOrders from './pages/algo-trade/dashboard/active-orders';
import PastOrders from './pages/algo-trade/dashboard/past-orders';
import PortfolioPerformance from './pages/algo-trade/dashboard/portfolio-performance';
import StrategyPerformance from './pages/algo-trade/dashboard/strategy-performance';
import AlgoBots from './pages/algo-trade/dashboard/algo-bots';
import AlgoStrategies from './pages/algo-trade/dashboard/algo-strategies';
import AccountSettings from './pages/algo-trade/dashboard/account-settings';
import VirtualTrade from './pages/algo-trade/dashboard/vitual-trade';
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
						<Route path='past-orders' element={<PastOrders />} />
						<Route path='portfolio-performance' element={<PortfolioPerformance />} />
						<Route path='strategy-performance' element={<StrategyPerformance />} />
						<Route path='algo-bots' element={<AlgoBots />} />
						<Route path='algo-strategies' element={<AlgoStrategies />} />
						<Route path='account-settings' element={<AccountSettings />} />
						<Route path='virtual-trade' element={<VirtualTrade />} />
					</Route>
					<Route path='validate' element={<RequiredAuth><ValidateClient /></RequiredAuth>}/>
				</Route>
				<Route path='*' element={<Error404 /> } />
			</Routes>
		</Router>
	)
};

export default AppRouter;
