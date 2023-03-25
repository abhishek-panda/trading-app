import styled from "styled-components";

interface CardProps {
	width?: number;
}

const Card = styled.div<CardProps>`
	width: ${props => props.width || 425}px;
	min-width: 425px;
	background-color: #fff;
	border-radius: 12px;
	padding: 24px;
	display: flex;
	flex-direction: column;
`;

export default Card;
