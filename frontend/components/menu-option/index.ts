import styled from "styled-components";


const MenuOption = styled.div`
	padding: 14px 0 14px 20px;
	margin-bottom: 8px;
	font-size: 14px;
	color: rgb(105, 117, 134);
	cursor: pointer;
	border-radius: 6px;
	background-color: transparent;
	transition-duration: 0.5s;
	transition-property: background-color;
	
	> a {
		text-decoration: none;
		color: rgb(105, 117, 134);
	}

	:has(> a.active-menu) {
		background-color: rgb(237,231,246);
	} 

	:hover {
		background-color: rgb(237,231,246);
	}
`;

export default MenuOption;
