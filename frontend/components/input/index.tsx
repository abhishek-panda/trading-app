import React from 'react';
import styled from "styled-components";


interface InputProps extends  React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
}

interface InputWrapperProps {
	hasError?: boolean
}

const InputWrapper = styled.div<InputWrapperProps>`
	display: flex;
	flex-direction: column;
	background: rgb(248, 250, 252);
	border: 1px solid ${props => props.hasError ? 'rgb(255,98,71)' : 'rgba(0, 0, 0, 0.23)'};
	height: 58px;
	border-radius: 12px;
	position: relative;
	overflow: hidden;

	& > input {
		outline: none;
		border: none;
		background-color: transparent;
		padding: 30.5px 14px 11px;
	}

	& > label {
		top: 14px;
		left: 14px;
		position: absolute;
		font-size: 11px;
		color: rgb(105, 117, 134);
	}
`;

const ErrorMessage = styled.span`
	color: rgb(255,98,71);
	font-size:11px;
`;


const Input: React.FC<InputProps> = (props) => {
	return (
		<>
		<InputWrapper hasError={Boolean(props.error)}>
			<input {...props} />
			<label >{props.label}</label>
		</InputWrapper>
		{props.error && <ErrorMessage>{props.error}</ErrorMessage>}
		</>
	);
}

export default Input;
