import styled from "styled-components";

interface ButtonProps {
	buttonColor?: string;
	borderColor?: string;
	hasBorder?: boolean;
}

const Button = styled.button<ButtonProps>`
	width: 100%;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	background-color: ${(props) => props.buttonColor || "rgb(248, 250, 252)"};
	border: ${props => {
		const { hasBorder = true } = props;
		return hasBorder ? `1px solid ${props.borderColor || "rgb(238, 242, 246)"}` : 'none';
	}};
	border-radius: 4px;
	box-shadow: none;
	transition-duration: 0.3s;
	transition-property: box-shadow;

	:hover {
		box-shadow: 0 0 0 1px rgb(103, 58, 183);
	}
`;

export default Button;
