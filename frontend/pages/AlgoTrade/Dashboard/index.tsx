import React, { useCallback} from 'react';
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
		<Option>Account Settings</Option>,
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
					<MenuOption onClick={_ => navigate('active')}>Active</MenuOption>
					<MenuOption onClick={_ => navigate('past')}>Past</MenuOption>
				</MenuSection>
				<Seperator />
				<MenuSection>
					<MenuSectionTitle>Performance</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('portfolio')} >Portfolio</MenuOption>
					<MenuOption onClick={_ => navigate('strategy')} >Strategy</MenuOption>
				</MenuSection>
				<Seperator />
				<MenuSection>
					<MenuSectionTitle>Algos</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('bots')}>Bots</MenuOption>
					<MenuOption onClick={_ => navigate('strategies')}>Strategies</MenuOption>
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
