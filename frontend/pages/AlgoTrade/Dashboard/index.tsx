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
import { HeaderMenu, MenuOption, Seperator } from '../../../components'

const UserSettingOptions = [
	<Option>Account Settings</Option>,
	<Option>Logout</Option>
];

const Dashboard = () => {

	const navigate = useNavigate();

	return (
		<DashboardpageWrapper>
			<Header>
				<HeaderMenuWrapper>
					<HeaderMenu placeholder={<UserSettingMenu />} options={UserSettingOptions}/>
				</HeaderMenuWrapper>
        	</Header>
			<Nav>
				<Logo>
					<img src="https://themewagon.com/wp-content/uploads/2021/03/Frame-172-1.png" />
				</Logo>
				<MenuSection>
					<MenuSectionTitle>Dashboard</MenuSectionTitle>
					<MenuOption onClick={_ => navigate('home')}>Home</MenuOption>
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
