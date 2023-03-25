import styled, { keyframes } from "styled-components";


interface LoaderProps {
	diameter: number;
	thickness: number;
}

const spinAnimation = keyframes`
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
`;

const Loader = styled.div<LoaderProps>`
	border: ${props => props.thickness || 4}px solid #f3f3f3;
	border-radius: 50%;
	border-top: ${props => props.thickness || 4}px solid #3498db;
	width: ${props => props.diameter || 50}px;
	height: ${props => props.diameter || 50}px;
	animation: ${spinAnimation} 2s linear infinite;
`;


export default Loader;
