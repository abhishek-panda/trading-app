import React from 'react';
import styled from 'styled-components';


interface HeaderMenuProps {
	placeholder: React.ReactNode;
	options?: React.ReactNode[];
}

export const HeaderMenuWrapper = styled.div`
	position: relative;
	:hover > section {
		display: block;
	}
`;

export const DropDownMenuWrapper = styled.section`
	position: absolute;
	right: 0;
	background-color: #fff;
	min-width: 150px;
	border-radius: 12px;
	box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.2);
	display: none;
	& ul {
		padding: 10px;
	}
	& li {
		list-style-type: none;
	}
`;



const HeaderMenu: React.FC<HeaderMenuProps> = (props) => {
	const {options = [], placeholder} = props;
	return (
		<HeaderMenuWrapper>
			{placeholder}
			{options.length > 0 && (
				<DropDownMenuWrapper>
					<ul>
						{options.map((option, index) => <li key={index}>{option}</li>)}
					</ul>
				</DropDownMenuWrapper>
			)}
		</HeaderMenuWrapper>
	)
}

export default HeaderMenu;
