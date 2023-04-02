import React from 'react';
import {Outlet, NavLink, useNavigate} from 'react-router-dom'
import {
	DashboardpageWrapper,
	Nav,
	Header,
	Main,
	HeaderMenuWrapper,
	UserSettingMenu,
	Logo,
	Content,
	MenuSection,
	MenuSectionTitle,
	Option
} from './style';
import { HeaderMenu, MenuOption, Seperator } from '../../../components';
import { logo }  from '../../../images';
import { useAuth } from '../../../utils/contexts/auth';


const Dashboard = () => {

	const navigate = useNavigate();
	const auth = useAuth();

	const UserSettingOptions = [
		<Option onClick={_ => navigate('account-settings')}>Account Settings</Option>,
		<Option onClick={()=> auth?.logout()}>Logout</Option>
	];

	return (
		<DashboardpageWrapper>
			<Header>
				<HeaderMenuWrapper>
					<HeaderMenu placeholder={<UserSettingMenu />} options={UserSettingOptions}/>
				</HeaderMenuWrapper>
        	</Header>
			<Nav>
				<Logo>
					<img src={logo} />
				</Logo>
				<MenuSection>
					<MenuSectionTitle>Dashboard</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('home')}>
						<NavLink to="home" className={({ isActive }) => isActive ? 'active-menu' : ''}>Home</NavLink>
					</MenuOption>
				</MenuSection>
				<Seperator />
				<MenuSection>
					<MenuSectionTitle>Postions</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('active-orders')}>
						<NavLink to="active-orders" className={({ isActive }) => isActive ? 'active-menu' : ''}>Active</NavLink>
					</MenuOption>
					<MenuOption onClick={_ => navigate('past-orders')}>
						<NavLink to="past-orders" className={({ isActive }) => isActive ? 'active-menu' : ''}>Past</NavLink>
					</MenuOption>
				</MenuSection>
				<Seperator />
				<MenuSection>
					<MenuSectionTitle>Performance</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('portfolio-performance')} >
						<NavLink to="portfolio-performance" className={({ isActive }) => isActive ? 'active-menu' : ''}>Portfolio</NavLink>
					</MenuOption>
					<MenuOption onClick={_ => navigate('strategy-performance')} >
						<NavLink to="strategy-performance" className={({ isActive }) => isActive ? 'active-menu' : ''}>Strategy</NavLink>
					</MenuOption>
				</MenuSection>
				<Seperator />
				<MenuSection>
					<MenuSectionTitle>Algo</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('algo-bots')}>
						<NavLink to="algo-bots" className={({ isActive }) => isActive ? 'active-menu' : ''}>Bots</NavLink>
					</MenuOption>
					<MenuOption onClick={_ => navigate('algo-strategies')}>
						<NavLink to="algo-strategies" className={({ isActive }) => isActive ? 'active-menu' : ''}>Strategies</NavLink>
					</MenuOption>
				</MenuSection>
			</Nav>
			<Main>
				<Content>
					<Outlet />
				</Content>
			</Main>
		</DashboardpageWrapper>
	)
}

export default Dashboard;
