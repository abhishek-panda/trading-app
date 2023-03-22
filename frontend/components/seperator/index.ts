import styled from "styled-components";


interface SeperatorProps {
	color?: string;
}

const Seperator = styled.hr<SeperatorProps>`
	border: none;
	border-bottom: 1px solid ${props => props.color || 'rgb(227, 232, 239)'};
	align-self: stretch;
`;

export default Seperator;
