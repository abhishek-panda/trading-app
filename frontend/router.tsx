import React from 'react';
import { BrowserRouter as Router, Routes , Route, NavLink } from 'react-router-dom';
import ComingSoon from './pages/coming-soon';
import Blog from './pages/blog'
import Error404 from './pages/404';
import AlgoTrade from './pages/algo-trade'
import Login from './pages/algo-trade/login';
import Register from './pages/algo-trade/register';
import ValidateClient from './pages/algo-trade/users/validate-client';
import Dashboard from './pages/algo-trade/users/dashboard';
import AdminDashboard from './pages/algo-trade/admin/dashboard';
import Home from './pages/algo-trade/users/dashboard/home';
import ActiveOrders from './pages/algo-trade/users/dashboard/active-orders';
import PastOrders from './pages/algo-trade/users/dashboard/past-orders';
import PortfolioPerformance from './pages/algo-trade/users/dashboard/portfolio-performance';
import StrategyPerformance from './pages/algo-trade/users/dashboard/strategy-performance';
import AlgoBots from './pages/algo-trade/users/dashboard/algo-bots';
import AlgoStrategies from './pages/algo-trade/users/dashboard/algo-strategies';
import AccountSettings from './pages/algo-trade/users/dashboard/account-settings';
import VirtualTrade from './pages/algo-trade/users/dashboard/vitual-trade';
import Controls from './pages/algo-trade/admin/dashboard/controls';
import StrategySetup from './pages/algo-trade/admin/dashboard/strategy-setup';
import RequiredAuth from './utils/RequiredAuth';
import { AuthProvider } from './utils/contexts/auth';
import { UserRole } from '../libs/typings';

const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<ComingSoon />} />
				<Route index element={<ComingSoon />} />
				<Route path='blog' element={<Blog />}/>
				<Route element={<AuthProvider />}>
					<Route path='algotm' element={<AlgoTrade />}>
						<Route index element={<Login />} />
						<Route path='login' element={<Login />} />
						<Route path='register' element={<Register />} />
						<Route element={<RequiredAuth allowedRoles={[UserRole.USER, UserRole.ADMIN]} />}>
							<Route path='dashboard' element={<Dashboard />}>
								<Route index element={<AlgoBots />} />
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
							<Route path='validate' element={<ValidateClient />}/>
						</Route>

						<Route element={<RequiredAuth allowedRoles={[UserRole.ADMIN]} />}>
							<Route path='admin' element={<AdminDashboard />}>
								<Route index element={<AlgoBots />} />
								<Route path='controls' element={<Controls />} />
								<Route path='algo-bots' element={<AlgoBots />} />
								<Route path='strategy-setup' element={<StrategySetup />} />
							</Route>
							<Route path='validate' element={<ValidateClient />}/>
						</Route>
					</Route>
				</Route>
				<Route path='*' element={<Error404 /> } />
			</Routes>
		</Router>
	)
};

export default AppRouter;
