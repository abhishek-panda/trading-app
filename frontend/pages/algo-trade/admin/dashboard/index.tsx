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
import { HeaderMenu, MenuOption } from '../../../../components';
import { logo }  from '../../../../images';
import { useAuth } from '../../../../utils/contexts/auth';


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
					<MenuOption onClick={_ => navigate('controls')}>
						<NavLink to="controls" className={({ isActive }) => isActive ? 'active-menu' : ''}>Controls</NavLink>
					</MenuOption>
					<MenuOption onClick={_ => navigate('algo-bots')}>
						<NavLink to="algo-bots" className={({ isActive }) => isActive ? 'active-menu' : ''}>Bots</NavLink>
					</MenuOption>
					<MenuOption onClick={_ => navigate('strategy-setup')}>
						<NavLink to="strategy-setup" className={({ isActive }) => isActive ? 'active-menu' : ''}>Strategy Setup</NavLink>
					</MenuOption>
				</MenuSection>
			</Nav>
			<Main>
				<Content>
					<div className='content-container'>
						<Outlet />
					</div>
				</Content>
			</Main>
		</DashboardpageWrapper>
	)
}

export default Dashboard;
