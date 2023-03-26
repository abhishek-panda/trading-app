import React from 'react';
import styled from "styled-components";

export const DashboardpageWrapper = styled.div`
	height: 100vh;
	background-color: white;
	display: grid;
	grid-template-rows: 70px auto;
	grid-template-columns: 250px auto;
	grid-template-areas:
		"nav header"
		"nav main"
	;
`;

export const Header = styled.header`
	grid-area: header;
	display: flex;
	justify-content: flex-end;
	align-items: center;
`;

export const Nav = styled.nav`
	grid-area: nav;
	padding: 20px;
`;

export const Main = styled.main`
	grid-area: main;
`;

export const HeaderMenuWrapper = styled.div`
	margin-right: 20px;
`;


const Menu = styled.div`
	border-radius: 25px;
	background-color: grey;
	display: grid;
	cursor: pointer;
	align-items: center;
	justify-items: center;
	grid-template-columns: 1fr 1fr;
`;

const UserProfile = styled.div`
	padding: 5px;
	width: 30px;
	height: 30px;
	background-color: rgb(237,231,246);
	border-radius: 100%;
	color: black;
	text-align: center;
	margin: 10px;
`

export const UserSettingMenu = () => {
	return (
		<Menu>
			<UserProfile>A</UserProfile>
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width="1.5rem" height="1.7rem" viewBox="0 0 24 24" stroke-width="1.5" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path><circle cx="12" cy="12" r="3"></circle></svg>
			</div>
		</Menu>
	);
}

export const Logo = styled.div`
	width: 35px;
	& > img {
		width: 100%;
	}
`;

export const Content = styled.div`
	margin-right: 20px;
	background-color: rgb(238,242,246);
	height: 100%;
	border-radius: 10px 10px 0 0;
`;

export const MenuSection = styled.section`
	padding: 15px 0 0 0;
`;

export const MenuSectionTitle = styled.span`
	color: black;
	font-size: 14px;
	font-weight: bold;
	display: inline-block;
	padding-bottom: 10px;
`;

export const Option = styled.div`
	padding: 14px 10px;
	margin-bottom: 8px;
	font-size: 14px;
	color: rgb(105, 117, 134);
	cursor: pointer;
	border-radius: 6px;
	background-color: transparent;
	transition-duration: 0.5s;
	transition-property: background-color;
	:hover {
		background-color: rgb(237,231,246);
	}
`
